"use client";

import { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  

  const uploadFile = async (selectedFile: File) => {
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setColumns(response.data.columns);
      setPreview(response.data.rows);

      setResult(null);
      setStatus("");
    } catch (error: any) {
      console.error(error);

      if (error.response) {
        alert(error.response.data.error || "Invalid CSV file");
      } else {
        alert("Network Error. Please check if the backend is running.");
      }
    }
  };

  const processData = async () => {
    setLoading(true);
    setStatus("AI Extracting CRM Records...");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/process",
        {
          records: preview,
        }
      );
      setResult(response.data);
      setStatus("✅ Processing Complete!");


    } catch (err: any) {
      console.error(err);
      setStatus("❌ Processing Failed");

      if (err.response) {
        alert(err.response.data.error || "Gemini processing failed.");
      } else {
        alert("Cannot connect to the backend.");
      }
    }

    setLoading(false);
  };
  const downloadCSV = () => {
    if (!result || result.records.length === 0) {
      alert("No records to download.");
      return;
    }

    const headers = Object.keys(result.records[0]);

    const rows = result.records.map((row: any) =>
      headers
        .map((header) => `"${row[header] ?? ""}"`)
        .join(",")
    );

    const csv =
      headers.join(",") + "\n" + rows.join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });


    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "crm_records.csv";

    a.click();

    window.URL.revokeObjectURL(url);
  };
  const filteredRecords =
    result?.records.filter((record: any) =>
      record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      uploadFile(selected);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    multiple: false,
  });

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-10">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-6xl">

        <h1 className="text-3xl font-bold text-center mb-6">
          GrowEasy AI CSV Importer
        </h1>

        <div
          {...getRootProps()}
          className="border-2 border-dashed border-blue-400 rounded-lg p-10 text-center cursor-pointer hover:border-blue-600 transition"
        >
          <input {...getInputProps()} />

          {isDragActive ? (
            <p className="text-blue-600 font-semibold text-lg">
              Drop the CSV file here...
            </p>
          ) : (
            <>
              <p className="text-xl font-semibold">
                Drag & Drop your CSV here
              </p>

              <p className="text-gray-500 mt-2">
                or click to browse
              </p>
            </>
          )}

          {file && (
            <p className="mt-5 text-green-600 font-semibold">
              ✅ Selected File: {file.name}
            </p>
          )}
        </div>

        {preview.length > 0 && (
          <>

            <h2 className="text-2xl font-bold mt-8 mb-4">
              CSV Preview
            </h2>
            <div className="overflow-auto border rounded max-h-96">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-200 sticky top-0">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="border p-2">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {preview.map((row, index) => (
                    <tr key={index}>
                      {columns.map((col) => (
                        <td key={col} className="border p-2">
                          {row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {status && (
              <p
                className={`text-center font-semibold mt-5 ${status.includes("Failed")
                  ? "text-red-600"
                  : status.includes("Complete")
                    ? "text-green-600"
                    : "text-blue-600"
                  }`}
              >
                {status}
              </p>
            )}
            <div className="flex justify-center mt-6">
              <button
                onClick={processData}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:bg-gray-400"
              >
                {loading
                  ? "🤖 AI is extracting CRM records..."
                  : "Confirm Import"}
              </button>
            </div>

            {result && (
              <div className="mt-8">

                <div className="bg-green-100 p-4 rounded-lg mb-6">
                  <h2 className="text-2xl font-bold">
                    Import Summary
                  </h2>

                  <p className="mt-2">
                    ✅ Imported Records: {result.records.length}
                  </p>

                  <p>
                    ❌ Skipped Records: {result.skipped}
                  </p>
                  <button
                    onClick={downloadCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded mt-4"
                  >
                    ⬇ Download CRM CSV
                  </button>
                </div>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="🔍 Search by Name or Email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="overflow-auto border rounded max-h-96">
                  <table className="min-w-full border-collapse">
                    <thead className="bg-gray-200 sticky top-0">
                      <tr>
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Phone</th>
                        <th className="border p-2">City</th>
                        <th className="border p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map(
                        (record: any, index: number) => (
                          <tr key={index}>
                            <td className="border p-2">
                              {record.name}
                            </td>

                            <td className="border p-2">
                              {record.email}
                            </td>

                            <td className="border p-2">
                              {record.mobile_without_country_code}
                            </td>

                            <td className="border p-2">
                              {record.city}
                            </td>

                            <td className="border p-2">
                              {record.crm_status}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

          </>
        )}

      </div>
    </main>
  );
}