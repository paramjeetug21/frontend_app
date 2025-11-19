import React, { useEffect, useState } from "react";
import { getVersions } from "../services/documentService";

export const VersionSidebar = ({ documentId, onRollback }) => {
  const [versions, setVersions] = useState([]);

  const fetchVersions = async () => {
    const v = await getVersions(documentId);
    setVersions(v);
  };

  useEffect(() => {
    fetchVersions();
  }, [documentId]);

  const handleClickVersion = (version) => {
    const versionWindow = window.open("", "_blank");
    versionWindow.document.write(`
      <h3>Version created at: ${new Date(
        version.createdAt
      ).toLocaleString()}</h3>
      <pre>${JSON.stringify(version.content, null, 2)}</pre>
      <button id="rollbackBtn">Rollback this version</button>
    `);

    versionWindow.document.getElementById("rollbackBtn").onclick = async () => {
      await onRollback(documentId, version.id);
      versionWindow.close();
      fetchVersions(); // refresh sidebar
    };
  };

  if (versions.length === 0)
    return <p className="mt-2 text-gray-600">No versions available</p>;

  return (
    <div className="mt-4 border-t pt-2">
      <h3 className="font-bold mb-2">Version History</h3>
      {versions.map((v) => (
        <div
          key={v.id}
          className="cursor-pointer p-1 hover:bg-gray-200 rounded"
          onClick={() => handleClickVersion(v)}
        >
          {new Date(v.createdAt).toLocaleString()} {v.createdBy} version
        </div>
      ))}
    </div>
  );
};
