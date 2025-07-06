import React, { useEffect, useState } from "react";
import axios from "axios";

interface Task {
  day: number;
  title: string;
  description: string;
}

interface InternshipForm {
  coursename: string;
  field: string;
  discription: string;
  duration: string;
  status: "Active" | "Inactive";
  dailyTasks: Task[];
}

interface Internship extends InternshipForm {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

const AdminInternshipManager: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [form, setForm] = useState<InternshipForm>({
    coursename: "",
    field: "",
    discription: "",
    duration: "",
    status: "Active",
    dailyTasks: [],
  });

  const fetchInternships = async () => {
    try {
      const res = await axios.get<Internship[]>("http://localhost:5000/api/internships");
      setInternships(res.data);
    } catch (err) {
      console.error("Failed to fetch internships", err);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const handleTaskAdd = () => {
    setForm((prevForm) => {
      const newTask: Task = {
        day: prevForm.dailyTasks.length + 1,
        title: "",
        description: "",
      };
      return {
        ...prevForm,
        dailyTasks: [...prevForm.dailyTasks, newTask],
      };
    });
  };

  const handleTaskChange = (index: number, field: keyof Task, value: string) => {
    const updatedTasks = [...form.dailyTasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      [field]: value,
    };
    setForm({ ...form, dailyTasks: updatedTasks });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.coursename || !form.field || !form.duration || !form.discription) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/internships", form);
      alert("Internship Created ✅");
      setForm({
        coursename: "",
        field: "",
        discription: "",
        duration: "",
        status: "Active",
        dailyTasks: [],
      });
      fetchInternships();
    } catch (err) {
      console.error("Error creating internship", err);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📚 Create Internship</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-cardbg p-6 rounded-xl shadow-md">
        <input
          name="coursename"
          value={form.coursename}
          onChange={handleFormChange}
          className="border p-2 w-full rounded"
          placeholder="Course Name"
        />
        <input
          name="field"
          value={form.field}
          onChange={handleFormChange}
          className="border p-2 w-full rounded"
          placeholder="Field (e.g. Web Dev, AI)"
        />
        <textarea
          name="discription"
          value={form.discription}
          onChange={handleFormChange}
          className="border p-2 w-full rounded"
          placeholder="Description"
        />
        <input
          name="duration"
          value={form.duration}
          onChange={handleFormChange}
          className="border p-2 w-full rounded"
          placeholder="Duration (e.g. 1 Month)"
        />
        <select
          name="status"
          value={form.status}
          onChange={handleFormChange}
          className="border p-2 w-full rounded"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <div>
          <h2 className="font-semibold mb-2">📝 Daily Tasks</h2>
          {form.dailyTasks.map((task, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="text"
                placeholder={`Day ${task.day} Title`}
                value={task.title}
                onChange={(e) => handleTaskChange(index, "title", e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder={`Day ${task.day} Description`}
                value={task.description}
                onChange={(e) => handleTaskChange(index, "description", e.target.value)}
                className="border p-2 rounded"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleTaskAdd}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
          >
            ➕ Add Task
          </button>
        </div>

        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          ✅ Create Internship
        </button>
      </form>

      <div className="mt-10 bg-cardbg p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-2">📋 Existing Internships</h2>
        {internships.length === 0 ? (
          <p>No internships available.</p>
        ) : (
          internships.map((item) => (
            <div key={item._id} className="border rounded p-4 mb-4 bg-cardbg shadow">
              <h3 className="text-lg font-semibold">{item.coursename} ({item.duration})</h3>
              <p><strong>Field:</strong> {item.field}</p>
              <p><strong>Status:</strong> {item.status}</p>
              <p><strong>Description:</strong> {item.discription}</p>
              {Array.isArray(item.dailyTasks) && item.dailyTasks.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">🗓️ Daily Tasks:</p>
                  <ul className="list-disc ml-6">
                    {item.dailyTasks.map((task) => (
                      <li key={task.day}><b>Day {task.day}:</b> {task.title} - {task.description}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminInternshipManager;
