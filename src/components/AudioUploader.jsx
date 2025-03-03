// src/components/AudioUploader.jsx - 多人会议分析组件
import React, { useState } from "react";
import asr_null from "../mock/asr_null.json";
import asr_speaker from "../mock/asr_speaker.json";
// todo result的mock数据
import resultData from "../mock/asr_speaker.json";

function AudioUploader() {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [asrInfo, setAsrInfo] = useState(null);
  const [result, setResult] = useState(null);
  const [isMock, setIsMock] = useState(false);

  // 处理文件选择
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    // 检查是否为任何音频格式（MIME 类型以 audio/ 开头）
    if (selectedFile && selectedFile.type.startsWith("audio/")) {
      setFile(selectedFile);
      setAsrInfo(null);
      setResult(null);
      setError(null);
    } else {
      setFile(null);
      setError("请选择有效的音频文件。");
    }
  };

  // 处理文件上传
  const handleUpload = async () => {
    if (isMock) {
      if (!asrInfo) {
        // setAsrInfo(asr_null);
        setAsrInfo(asr_speaker);
      } else {
        setResult(resultData);
      }
    } else {
      if (!file) {
        setError("请先选择文件。");
        return;
      }

      setIsLoading(true);
      setError(null);

      if (!asrInfo) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          const response = await fetch("http://localhost:8000/asr", {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
          }
          const data = await response.json();
          if (data.status === "success" && data.code === 0) {
            setAsrInfo(data);
          } else {
            throw new Error("处理失败");
          }
        } catch (err) {
          setError(`错误: ${err.message}`);
          setAsrInfo(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        // // todo: 模拟请求
        // setResult(asrInfo);
        // setIsLoading(false);
        const requestData = {
          asr_str: asrInfo.data
        };
  
        try {
          const response = await fetch("http://localhost:8000/meeting", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          });
          if (!response.ok) {
            throw new Error(`HTTP错误! 状态码: ${response.status}`);
          }
          const data = await response.json();
          if (data.status === "success" && data.code === 0) {
            setResult(data.data);
          } else {
            throw new Error("处理失败");
          }
        } catch (err) {
          setError(`错误: ${err.message}`);
          setResult(null);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const RenderSentences = ({ sentences }) => {
    const getSpeakerStyle = (spk) => {
      switch (spk) {
        case 0:
          return { color: "white", backgroundColor: "#66708f", padding: "5px", borderRadius: "5px" };
        case 1:
          return { color: "black", fontStyle: "italic", backgroundColor: "#dcdfe4", padding: "5px", borderRadius: "5px" };
        default:
          return { color: "black" };
      }
    };
    console.log(sentences);

    // If it has sentence_info (structured speaker data)
    if (Array.isArray(sentences.sentence_info)) {
      return (
        <div>
          {sentences.sentence_info.map((sentence, index) => (
            <div key={index} style={{ ...getSpeakerStyle(sentence.spk), marginBottom: "10px" }}>
              <span>{`Speaker ${sentence.spk}: `}</span>
              <span>{sentence.text}</span>
            </div>
          ))}
        </div>
      );
    }
    
    // If it has plain text data (but not already handled by the API response case)
    else if (sentences.data) {
      return <div className="text-gray-800 whitespace-pre-line">{sentences.data}</div>;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex flex-col items-center space-y-6">
        {/* 文件上传区域 */}
        <label className="w-full">
          <div className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 mb-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-600 font-medium">
                <span className="font-semibold text-blue-600">点击上传</span> 或拖放文件
              </p>
              <p className="text-xs text-gray-500">支持所有音频格式</p>
            </div>
            <input type="file" className="hidden" accept="audio/*" onChange={handleFileChange} />
          </div>
        </label>

        {/* 已选文件提示 */}
        {file && (
          <div className="text-sm text-gray-700 bg-blue-50 px-4 py-2 rounded-md w-full text中心 shadow-sm">
            已选择文件: <span className="font-medium">{file.name}</span>
          </div>
        )}

        {/* 上传按钮 */}
        <button
          onClick={handleUpload}
          disabled={(!file || isLoading) && !isMock}
          className={`px-6 py-3 rounded-md text-white font-medium shadow-sm transition-all duration-300 ${
            !file || isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-md active:translate-y-0.5"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              处理中...
            </span>
          ) : !asrInfo ? (
            "获取ASR结果"
          ) : (
            "分析结果并展示"
          )}
        </button>

        {/* 错误提示 */}
        {error && <div className="w-full p-4 text-red-700 bg-red-50 rounded-lg border-l-4 border-red-500 shadow-sm">{error}</div>}

        {/* asr结果显示区域 */}
        {asrInfo && !result && (
          <div>
            <h2 className="text-md font-semibold text-gray-800 mb-2">asr结果</h2>
            <RenderSentences sentences={asrInfo} />
          </div>
        )}

        {/* 分析结果显示区域 */}
        {result && (
          <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            {/* 会议标题 */}
            <div className="border-b p-5 bg-gradient-to-r from-blue-50 to-white">
              <h2 className="text-xl font-bold text-gray-800">{result.Breakdown.meeting_name}</h2>
              <p className="text-sm text-gray-600 mt-1">{result.Breakdown.description}</p>
            </div>

            {/* 摘要部分 */}
            <div className="p-5 bg-blue-50 border-b">
              <h3 className="text-md font-semibold text-gray-800 mb-2">摘要</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{result.Breakdown.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-gray-50">
              {/* 任务部分 */}
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-blue-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  任务
                </h3>
                <ul className="space-y-3">
                  {result.Breakdown.tasks?.map((task, idx) => (
                    <li
                      key={idx}
                      className="text-sm bg-gray-50 p-3 rounded-md border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200"
                    >
                      <div className="font-medium">{task.description}</div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>
                          负责人: <span className="font-medium">{task.assigned_to}</span>
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full flex items-center ${
                            task.priority === "High"
                              ? "bg-red-100 text-red-700 border border-red-300"
                              : task.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                              : "bg-green-100 text-green-700 border border-green-300"
                          }`}
                        >
                          {task.priority === "High" && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {task.priority === "Medium" && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {task.priority !== "High" && task.priority !== "Medium" && (
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                          {/* 将英文优先级翻译成中文显示 */}
                          {task.priority === "High" ? "高" : task.priority === "Medium" ? "中" : "低"}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 决策部分 */}
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-green-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  决策
                </h3>
                <ul className="space-y-3">
                  {result.Breakdown.decisions?.map((decision, idx) => (
                    <li
                      key={idx}
                      className="text-sm bg-gray-50 p-3 rounded-md border border-gray-100 hover:border-green-200 hover:bg-green-50 transition-colors duration-200"
                    >
                      {decision.description}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 问题部分 */}
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-purple-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  问题
                </h3>
                <ul className="space-y-3">
                  {result.Breakdown.questions?.map((q, idx) => (
                    <li
                      key={idx}
                      className="text-sm bg-gray-50 p-3 rounded-md border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-colors duration-200"
                    >
                      <div className="font-medium">{q.question}</div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>
                          提问者: <span className="font-medium">{q.raised_by}</span>
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full ${q.status === "未回答" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
                        >
                          {q.status}
                        </span>
                      </div>
                      {q.answer && <div className="mt-2 text-xs bg-blue-50 p-3 rounded-md">{q.answer}</div>}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 洞见部分 */}
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-amber-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  洞见
                </h3>
                <ul className="space-y-3">
                  {result.Breakdown.insights?.map((insight, idx) => (
                    <li
                      key={idx}
                      className="text-sm bg-gray-50 p-3 rounded-md border border-gray-100 hover:border-amber-200 hover:bg-amber-50 transition-colors duration-200"
                    >
                      {insight.description}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 截止日期部分 */}
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-red-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  截止日期
                </h3>
                <ul className="space-y-3">
                  {result.Breakdown.deadlines?.map((deadline, idx) => (
                    <li
                      key={idx}
                      className="text-sm bg-gray-50 p-3 rounded-md border border-gray-100 hover:border-red-200 hover:bg-red-50 transition-colors duration-200 flex justify-between"
                    >
                      <span>{deadline.description}</span>
                      <span className="font-medium text-red-600">{deadline.date}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 参会人员部分 */}
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-indigo-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  参会人员
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.Breakdown.attendees?.map((person, idx) => (
                    <span
                      key={idx}
                      className="text-sm px-4 py-2 bg-gray-50 border border-gray-100 rounded-full hover:bg-indigo-50 hover:border-indigo-200 transition-colors duration-200"
                    >
                      {person.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* 后续跟进部分 */}
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="font-semibold text-gray-800 mb-4 flex items中心 text-cyan-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                  后续跟进
                </h3>
                <ul className="space-y-3">
                  {result.Breakdown.follow_ups?.map((item, idx) => (
                    <li
                      key={idx}
                      className="text-sm bg-gray-50 p-3 rounded-md border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50 transition-colors duration-200"
                    >
                      <div>{item.description}</div>
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>
                          负责人: <span className="font-medium">{item.owner}</span>
                        </span>
                        <span className="font-medium text-cyan-700">截止日期: {item.due_date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 风险部分 */}
              <div className="bg白 p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-orange-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  风险
                </h3>
                <ul className="space-y-3">
                  {result.Breakdown.risks?.map((risk, idx) => (
                    <li
                      key={idx}
                      className="text-sm bg-gray-50 p-3 rounded-md border-l-4 border-l-orange-400 border border-gray-100 hover:bg-orange-50 transition-colors duration-200"
                    >
                      {risk.description}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 议程部分 */}
              <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center text-emerald-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  议程
                </h3>
                <ol className="list-decimal list-inside space-y-2">
                  {result.Breakdown.agenda?.map((item, idx) => (
                    <li key={idx} className="text-sm p-3 bg-gray-50 rounded-md hover:bg-emerald-50 transition-colors duration-200">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AudioUploader;
