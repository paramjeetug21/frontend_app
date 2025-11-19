import axios from "axios";
import { useState } from "react";

export default function FileUploader() {
  const [fileUrl, setFileUrl] = useState("");

  const uploadFile = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await axios.post(
      "http://localhost:5000/files/upload",
      formData
    );
    const key = uploadRes.data.key;

    const urlRes = await axios.get("http://localhost:5000/files/signed-url", {
      params: { key },
    });

    setFileUrl(urlRes.data.url);
  };

  return (
    <div>
      <input type="file" onChange={uploadFile} />

      {fileUrl && <img src={fileUrl} alt="uploaded" width="200" />}
    </div>
  );
}
