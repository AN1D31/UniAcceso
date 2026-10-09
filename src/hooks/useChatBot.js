import { useCallback, useState } from "react";
import { NODES, WELCOME_MESSAGE, addScores, buildProfile } from "../utils/chatBotFlow";
import { searchEducationalOffer } from "../utils/chatBotSearch";

const ERROR_MESSAGE = "Tuve un problema al consultar la información. Por favor, intenta de nuevo.";
const EMPTY_MESSAGE =
  "No encontré programas que coincidan con esas preferencias. Prueba de nuevo con otra área o con filtros más amplios.";
const RESULTS_MESSAGE = "¡Listo! Estos son los programas disponibles que coinciden con tus preferencias:";

const EMPTY_ANSWERS = { areas: [], modality: "any", level: "any", funding: "no_scholarship" };

let lastMessageId = 0;
const createMessage = (sender, content) => ({ id: ++lastMessageId, sender, ...content });

const buildInitialMessages = () => [
  createMessage("bot", { text: WELCOME_MESSAGE }),
  createMessage("bot", { text: NODES.start.question }),
];

// Finite state machine driven by the NODES graph. `nodeId` is the question currently shown;
// `status` is "asking" while waiting for a click, "searching" during the query and "done" after it.
export function useChatBot() {
  const [messages, setMessages] = useState(buildInitialMessages);
  const [nodeId, setNodeId] = useState("start");
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [quizScores, setQuizScores] = useState({});
  const [status, setStatus] = useState("asking"); // "asking" | "searching" | "done"

  const runSearch = useCallback(async (finalAnswers) => {
    setStatus("searching");
    const result = await searchEducationalOffer(finalAnswers);

    let botMessage;
    if (result.hasError) {
      botMessage = createMessage("bot", { text: ERROR_MESSAGE });
    } else if (!result.programs.length) {
      botMessage = createMessage("bot", { text: EMPTY_MESSAGE });
    } else {
      botMessage = createMessage("bot", { text: RESULTS_MESSAGE, results: result });
    }
    setMessages((previous) => [...previous, botMessage]);
    setStatus("done");
  }, []);

  const selectOption = useCallback(
    (option) => {
      if (status !== "asking") return;

      const node = NODES[nodeId];
      const nextNodeId = option.next ?? node.next;
      const newMessages = [createMessage("user", { text: option.label })];

      let nextAnswers = answers;
      let nextScores = option.resetScores ? {} : quizScores;
      if (node.scoring) nextScores = addScores(nextScores, option.scores);
      if (node.answerKey === "areas") nextAnswers = { ...answers, areas: option.areas };
      else if (node.answerKey) nextAnswers = { ...answers, [node.answerKey]: option.id };

      setQuizScores(nextScores);

      if (nextNodeId === "profile") {
        // End of the vocational test: show the analysis, then offer to search.
        const profile = buildProfile(nextScores);
        nextAnswers = { ...nextAnswers, areas: profile.areaIds };
        newMessages.push(
          createMessage("bot", { text: profile.text }),
          createMessage("bot", { text: NODES.confirm_search.question })
        );
        setNodeId("confirm_search");
      } else if (nextNodeId === "search") {
        setAnswers(nextAnswers);
        setMessages((previous) => [...previous, ...newMessages]);
        runSearch(nextAnswers);
        return;
      } else {
        newMessages.push(createMessage("bot", { text: NODES[nextNodeId].question }));
        setNodeId(nextNodeId);
      }

      setAnswers(nextAnswers);
      setMessages((previous) => [...previous, ...newMessages]);
    },
    [status, nodeId, answers, quizScores, runSearch]
  );

  const restart = useCallback(() => {
    setMessages(buildInitialMessages());
    setNodeId("start");
    setAnswers(EMPTY_ANSWERS);
    setQuizScores({});
    setStatus("asking");
  }, []);

  return {
    messages,
    options: status === "asking" ? NODES[nodeId].options : [],
    isSearching: status === "searching",
    isFinished: status === "done",
    selectOption,
    restart,
  };
}
