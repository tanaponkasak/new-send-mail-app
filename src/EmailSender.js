// EmailSender.js
import React, { useState } from 'react';

const EmailSender = () => {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [status, setStatus] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAttachmentFile(file);
            setStatus(`ไฟล์ที่เลือก: ${file.name}`);
        } else {
            setAttachmentFile(null);
            setStatus('');
        }
    };

    const handleSend = async () => {
        if (!recipientEmail || !subject || !body) {
            setStatus('❌ กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }

        setStatus('📤 กำลังส่งอีเมล...');

        let attachmentBase64 = null;
        let attachmentFileName = null;

        if (attachmentFile) {
            try {
                const reader = new FileReader();
                reader.readAsDataURL(attachmentFile);
                await new Promise((resolve, reject) => {
                    reader.onload = () => {
                        attachmentBase64 = reader.result.split(',')[1];
                        attachmentFileName = attachmentFile.name;
                        resolve();
                    };
                    reader.onerror = error => reject(error);
                });
            } catch (error) {
                console.error('File read error:', error);
                setStatus('❌ ไม่สามารถอ่านไฟล์ได้');
                return;
            }
        }

        try {
            const response = await fetch('http://localhost:5000/api/send-email-with-attachment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipientEmail,
                    subject,
                    body,
                    attachment: attachmentBase64,
                    attachmentFileName,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                setStatus('✅ ส่งอีเมลสำเร็จแล้ว!');
                setRecipientEmail('');
                setSubject('');
                setBody('');
                setAttachmentFile(null);
            } else {
                setStatus(`❌ ส่งไม่สำเร็จ: ${data.message || 'เกิดข้อผิดพลาด'}`);
            }
        } catch (error) {
            setStatus(`❌ การเชื่อมต่อล้มเหลว: ${error.message}`);
        }
    };

    return (
        <div className="form-container">
            <h2>📨 ส่งอีเมลพร้อมไฟล์แนบ</h2>
            <input type="email" placeholder="Recipient Email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} />
            <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
            <textarea placeholder="Email Body" value={body} onChange={e => setBody(e.target.value)} rows="8" />

            <label htmlFor="file-upload" className="custom-file-upload">
                {attachmentFile ? `📁 ${attachmentFile.name}` : 'เลือกไฟล์แนบ (ถ้ามี)'}
            </label>
            <input id="file-upload" type="file" onChange={handleFileChange} style={{ display: 'none' }} />

            <button onClick={handleSend}>Send Email</button>
            <p style={{ marginTop: '1rem' }}>{status}</p>

            <style jsx>{`
                .form-container {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-width: 500px;
                    margin: 20px auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                input, textarea {
                    padding: 10px;
                    border-radius: 4px;
                    border: 1px solid #ddd;
                    font-size: 16px;
                }
                button {
                    background-color: #007bff;
                    color: white;
                    padding: 10px;
                    border: none;
                    border-radius: 4px;
                    font-size: 16px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: #0056b3;
                }
                .custom-file-upload {
                    border: 1px solid #ccc;
                    padding: 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    background-color: #f9f9f9;
                }
            `}</style>
        </div>
    );
};

export default EmailSender;
