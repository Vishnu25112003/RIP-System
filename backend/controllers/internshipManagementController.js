const Internship = require("../models/internshipManagementModel")
const fs = require("fs").promises // Use promises version of fs
const mammoth = require("mammoth") // For .docx parsing
const path = require("path") // For path.extname

// Helper function to parse tasks from text content
async function parseTasksFromText(text) {
  const tasks = []
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  let currentTask = null
  let dayCounter = 0 // To ensure days are sequential or assigned if missing

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Match "Day X: Title" or "Day X - Y: Title"
    const dayMatch = line.match(/^Day\s*(\d+)(?:\s*-\s*(\d+))?:\s*(.+)$/i)
    if (dayMatch) {
      if (currentTask) {
        tasks.push(currentTask)
      }
      const startDay = Number.parseInt(dayMatch[1], 10)
      const endDay = dayMatch[2] ? Number.parseInt(dayMatch[2], 10) : startDay
      const title = dayMatch[3].trim()

      // For multi-day entries, create separate tasks for each day
      for (let d = startDay; d <= endDay; d++) {
        currentTask = {
          day: d,
          title: title,
          description: "",
          exercise: "",
          test: "",
        }
        tasks.push(currentTask)
        dayCounter = Math.max(dayCounter, d)
      }
      // After processing a day range, currentTask should point to the last one created
      currentTask = tasks[tasks.length - 1]
      continue
    }

    // Match "What to Learn Today: Description"
    const learnMatch = line.match(/^What to Learn Today:\s*(.+)$/i)
    if (learnMatch && currentTask) {
      currentTask.description = learnMatch[1].trim()
      continue
    }

    // Match "Task: Exercise"
    const taskMatch = line.match(/^Task:\s*(.+)$/i)
    if (taskMatch && currentTask) {
      currentTask.exercise = taskMatch[1].trim()
      continue
    }

    // Match "Weekly Task: Instructions" - This is a general task, not a 'test' in the schema sense.
    // It should create a new task entry.
    const weeklyTaskMatch = line.match(/^Weekly Task\s*:\s*(.+)$/i)
    if (weeklyTaskMatch) {
      if (currentTask) {
        // Push any pending daily task
        tasks.push(currentTask)
      }
      // Assign a day for weekly tasks, e.g., next multiple of 7 after last day
      const weeklyDay = Math.ceil((dayCounter + 1) / 7) * 7
      currentTask = {
        day: weeklyDay,
        title: "Weekly Task",
        description: weeklyTaskMatch[1].trim(), // The instructions go into 'description'
        exercise: "",
        test: "", // 'test' field remains empty unless explicitly a 'Weekly Test'
      }
      tasks.push(currentTask) // Push immediately as it's a distinct entry
      dayCounter = Math.max(dayCounter, weeklyDay)
      currentTask = null // Reset currentTask as weekly tasks are usually standalone
      continue
    }

    // Match "Weekly Test: Instructions" - This is for the 'test' field in the schema.
    const weeklyTestMatch = line.match(/^Weekly Test\s*:\s*(.+)$/i)
    if (weeklyTestMatch) {
      if (currentTask) {
        // Push any pending daily task
        tasks.push(currentTask)
      }
      const testDay = Math.ceil((dayCounter + 1) / 7) * 7 // Assign a day for weekly tests
      currentTask = {
        day: testDay,
        title: "Weekly Test",
        description: "",
        exercise: "",
        test: weeklyTestMatch[1].trim(), // The instructions go into 'test'
      }
      tasks.push(currentTask) // Push immediately as it's a distinct entry
      dayCounter = Math.max(dayCounter, testDay)
      currentTask = null // Reset currentTask as weekly tests are usually standalone
      continue
    }

    // Handle multi-line descriptions/exercises if they don’t start with a new keyword
    // This is a fallback and assumes continuation of the last filled field.
    if (currentTask) {
      if (currentTask.description && !currentTask.exercise && !currentTask.test) {
        currentTask.description += " " + line
      } else if (currentTask.exercise && !currentTask.test) {
        currentTask.exercise += " " + line
      } else if (currentTask.test) {
        // If test is filled, it's likely a multi-line test instruction
        currentTask.test += " " + line
      }
    }
  }

  if (currentTask) {
    tasks.push(currentTask)
  }

  const finalTasks = tasks.filter(
    (task) =>
      task.title.trim() !== "" ||
      task.description.trim() !== "" ||
      task.exercise.trim() !== "" ||
      task.test.trim() !== "",
  )
  finalTasks.sort((a, b) => a.day - b.day)

  if (finalTasks.length === 0) {
    throw new Error("No recognizable tasks found in the document. Please check the format.")
  }

  return finalTasks
}

exports.createInternship = async (req, res) => {
  try {
    const { coursename, field, description, duration, status } = req.body
    const tasks = req.body.tasks ? JSON.parse(req.body.tasks) : []

    const internship = new Internship({
      coursename,
      field,
      description,
      duration,
      status,
      image: req.file ? req.file.filename : null,
      dailyTasks: tasks,
    })

    await internship.save()
    res.status(201).json(internship)
  } catch (error) {
    console.error("❌ BACKEND ERROR:", error.message)
    res.status(500).json({ error: error.message })
  }
}

exports.getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find().sort({ createdAt: -1 })
    res.json(internships)
  } catch (error) {
    res.status(500).json({ error: "Error fetching internships" })
  }
}

exports.updateInternship = async (req, res) => {
  try {
    const { id } = req.params
    const { coursename, field, description, duration, status } = req.body
    const tasks = req.body.tasks ? JSON.parse(req.body.tasks) : undefined

    const updateData = {
      coursename,
      field,
      description,
      duration,
      status,
    }

    if (tasks !== undefined) {
      updateData.dailyTasks = tasks
    }

    if (req.file) {
      updateData.image = req.file.filename
    }

    const updated = await Internship.findByIdAndUpdate(id, updateData, { new: true })
    res.json(updated)
  } catch (error) {
    console.error("Update Error:", error.message)
    res.status(500).json({ error: "Error updating internship" })
  }
}

// Controller function for uploading and parsing tasks
exports.uploadTasks = async (req, res) => {
  try {
    const { id } = req.params // Internship ID
    const file = req.file // Uploaded file by multer

    if (!file) {
      return res.status(400).json({ error: "No document file uploaded." })
    }

    const filePath = file.path
    const fileExtension = path.extname(file.originalname).toLowerCase()
    let fileContent = ""

    if (fileExtension === ".txt") {
      fileContent = await fs.readFile(filePath, "utf8")
    } else if (fileExtension === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath })
      fileContent = result.value
    } else {
      await fs.unlink(filePath) // Delete unsupported file
      return res.status(400).json({ error: "Unsupported file type. Only .docx and .txt are allowed." })
    }

    // Parse the content into tasks from the uploaded document
    const parsedTasksFromDocument = await parseTasksFromText(fileContent)

    // Fetch the existing internship to get its current dailyTasks
    const existingInternship = await Internship.findById(id)
    if (!existingInternship) {
      await fs.unlink(filePath) // Clean up uploaded file
      return res.status(404).json({ error: "Internship not found." })
    }

    // Create a map for quick lookup of existing tasks by day
    const existingTasksMap = new Map(existingInternship.dailyTasks.map((task) => [task.day, task]))

    // Merge new tasks with existing ones
    parsedTasksFromDocument.forEach((newTask) => {
      if (existingTasksMap.has(newTask.day)) {
        // Task for this day already exists, update it
        const oldTask = existingTasksMap.get(newTask.day)
        existingTasksMap.set(newTask.day, {
          ...oldTask._doc, // Use _doc to get plain object from Mongoose document
          ...newTask, // Overwrite with new task data
        })
      } else {
        // New task for this day, add it
        existingTasksMap.set(newTask.day, newTask)
      }
    })

    // Convert map values back to an array and sort by day
    const mergedTasks = Array.from(existingTasksMap.values()).sort((a, b) => a.day - b.day)

    // Clean up the uploaded file
    await fs.unlink(filePath)

    // Return the merged tasks to the frontend for temporary display
    res.status(200).json({
      message: "Document uploaded and tasks parsed successfully! Review and click 'Save Manual Changes'.",
      parsedTasks: mergedTasks, // Return the merged tasks
      parsedTasksCount: mergedTasks.length,
    })
  } catch (error) {
    console.error("❌ Task Upload Error:", error.message)
    // If an error occurs, try to delete the uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path)
      } catch (unlinkError) {
        console.error("Error deleting uploaded file:", unlinkError.message)
      }
    }
    res.status(500).json({ error: error.message || "Failed to upload and parse tasks." })
  }
}
