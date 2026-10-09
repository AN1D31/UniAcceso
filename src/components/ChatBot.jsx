import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Bot, GraduationCap, Award, RotateCcw, Loader2 } from "lucide-react";
import { useChatBot } from "../hooks/useChatBot";
import { COVERAGE_LABELS } from "../utils/chatBotFlow";

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-sm bg-purple-700 flex items-center justify-center shrink-0">
      <Bot className="w-5 h-5 text-white" />
    </div>
  );
}

function ResultsList({ results }) {
  return (
    <div className="mt-3 space-y-3">
      {results.programs.length > 0 && (
        <div>
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            <GraduationCap className="w-3.5 h-3.5" /> Programas ({results.programs.length} de {results.totalPrograms})
          </p>
          <ul className="space-y-1">
            {results.programs.map((program) => (
              <li key={program.id}>
                <Link to={`/universidades/${program.universityId}`} className="block border border-gray-200 bg-white px-3 py-2 hover:border-purple-600 transition-colors">
                  <span className="block text-sm font-semibold text-gray-900">{program.name}</span>
                  <span className="block text-xs text-gray-500">
                    {[program.university, program.level, program.modality, program.duration > 0 ? `${program.duration} semestres` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
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
                <Link to={`/becas/${scholarship.id}`} className="block border border-gray-200 bg-white px-3 py-2 hover:border-purple-600 transition-colors">
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

// Embedded, click-only vocational test. Fills the height of its parent container.
const ChatBot = () => {
  const { messages, options, isSearching, isFinished, selectOption, restart } = useChatBot();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, options, isSearching]);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar mb-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            {message.sender === "bot" && <BotAvatar />}
            <div
              className={`max-w-[80%] text-sm p-3 font-medium ${
                message.sender === "user"
                  ? "bg-purple-700 text-white"
                  : "bg-white text-gray-800 border border-gray-200 leading-relaxed"
              }`}
            >
              <p className="whitespace-pre-line">{message.text}</p>
              {message.results && <ResultsList results={message.results} />}
            </div>
          </div>
        ))}

        {isSearching && (
          <div className="flex gap-3 justify-start">
            <BotAvatar />
            <div className="bg-white text-gray-600 text-sm p-3 border border-gray-200 font-medium flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> unIA está buscando opciones para ti...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-gray-200 pt-4">
        {isFinished ? (
          <button onClick={restart} className="w-full flex items-center justify-center gap-2 bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 rounded-sm transition-colors">
            <RotateCcw className="w-4 h-4" /> Volver a empezar
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => selectOption(option)}
                disabled={isSearching}
                className="bg-white border border-purple-700 text-purple-700 hover:bg-purple-700 hover:text-white font-semibold text-sm px-4 py-2 rounded-sm transition-colors disabled:opacity-50"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
