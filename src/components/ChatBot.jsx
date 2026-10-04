import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, GraduationCap, Award, RotateCcw, X } from "lucide-react";
import { useChatBot } from "../hooks/useChatBot";
import { COVERAGE_LABELS } from "../utils/chatBotFlow";

function ResultsList({ results }) {
  return (
    <div className="mt-3 space-y-3">
      {results.universities.length > 0 && (
        <div>
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            <GraduationCap className="w-3.5 h-3.5" /> Universidades
          </p>
          <ul className="space-y-1">
            {results.universities.map((university) => (
              <li key={university.id}>
                <Link to={`/universidades/${university.id}`} className="block rounded-sm border border-gray-200 bg-white px-3 py-2 hover:border-purple-600 transition-colors">
                  <span className="block text-sm font-semibold text-gray-900">{university.name}</span>
                  {university.location && <span className="block text-xs text-gray-500">{university.location}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {results.scholarships.length > 0 && (
        <div>
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            <Award className="w-3.5 h-3.5" /> Becas
          </p>
          <ul className="space-y-1">
            {results.scholarships.map((scholarship) => (
              <li key={scholarship.id}>
                <Link to={`/becas/${scholarship.id}`} className="block rounded-sm border border-gray-200 bg-white px-3 py-2 hover:border-purple-600 transition-colors">
                  <span className="block text-sm font-semibold text-gray-900">{scholarship.name}</span>
                  <span className="block text-xs text-gray-500">
                    {[COVERAGE_LABELS[scholarship.coverage], scholarship.university].filter(Boolean).join(" · ")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, options, isSearching, isFinished, selectOption, restart } = useChatBot();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, options, isSearching, isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] max-w-sm h-[32rem] max-h-[calc(100vh-6rem)] flex flex-col bg-white border border-gray-200 rounded-sm shadow-xl">
          <div className="flex items-center justify-between bg-purple-600 text-white px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span className="font-semibold text-sm">Orientador UniAcceso</span>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Cerrar chat" className="hover:bg-purple-700 rounded-sm p-1 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-sm px-3 py-2 text-sm ${
                    message.sender === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  <p>{message.text}</p>
                  {message.results && <ResultsList results={message.results} />}
                </div>
              </div>
            ))}
            {isSearching && (
              <div className="flex justify-start">
                <div className="rounded-sm border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500">Buscando opciones para ti...</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-200 bg-white p-3">
            {isFinished ? (
              <button onClick={restart} className="w-full flex items-center justify-center gap-2 rounded-sm bg-purple-600 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors">
                <RotateCcw className="w-4 h-4" /> Volver a empezar
              </button>
            ) : (
              <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => selectOption(option)}
                    className="rounded-sm border border-purple-600 px-3 py-1.5 text-sm font-medium text-purple-700 hover:bg-purple-600 hover:text-white transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Cerrar chat" : "Abrir orientador vocacional"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default ChatBot;
