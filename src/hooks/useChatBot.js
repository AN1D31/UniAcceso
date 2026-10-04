import { useCallback, useState } from "react";
import { FLOW_STEPS, WELCOME_MESSAGE } from "../utils/chatBotFlow";
import { searchEducationalOffer } from "../utils/chatBotSearch";

const ERROR_MESSAGE = "Tuve un problema al consultar la información. Por favor, intenta de nuevo.";
const EMPTY_MESSAGE =
  "No encontré resultados con esas opciones. Prueba de nuevo eligiendo otra área o modalidad.";
const RESULTS_MESSAGE = "¡Listo! Esto es lo que encontré para ti:";

let lastMessageId = 0;
const createMessage = (sender, content) => ({ id: ++lastMessageId, sender, ...content });

const buildInitialMessages = () => [
  createMessage("bot", { text: WELCOME_MESSAGE }),
  createMessage("bot", { text: FLOW_STEPS[0].question }),
];

// Finite state machine: one state per step of FLOW_STEPS, then "searching" and "done".
export function useChatBot() {
  const [messages, setMessages] = useState(buildInitialMessages);
  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const [status, setStatus] = useState("asking"); // "asking" | "searching" | "done"

  const currentStep = status === "asking" ? FLOW_STEPS[stepIndex] : null;

  const runSearch = useCallback(
    async (finalSelections) => {
      setStatus("searching");
      const result = await searchEducationalOffer(finalSelections);

      let botMessage;
      if (result.hasError) {
        botMessage = createMessage("bot", { text: ERROR_MESSAGE });
      } else if (!result.universities.length && !result.scholarships.length) {
        botMessage = createMessage("bot", { text: EMPTY_MESSAGE });
      } else {
        botMessage = createMessage("bot", { text: RESULTS_MESSAGE, results: result });
      }
      setMessages((previous) => [...previous, botMessage]);
      setStatus("done");
    },
    []
  );

  const selectOption = useCallback(
    (option) => {
      if (status !== "asking") return;

      const updatedSelections = { ...selections, [currentStep.id]: option.id };
      const newMessages = [createMessage("user", { text: option.label })];
      const isLastStep = stepIndex === FLOW_STEPS.length - 1;

      setSelections(updatedSelections);
      if (isLastStep) {
        setMessages((previous) => [...previous, ...newMessages]);
        runSearch(updatedSelections);
      } else {
        newMessages.push(createMessage("bot", { text: FLOW_STEPS[stepIndex + 1].question }));
        setMessages((previous) => [...previous, ...newMessages]);
        setStepIndex(stepIndex + 1);
      }
    },
    [status, selections, currentStep, stepIndex, runSearch]
  );

  const restart = useCallback(() => {
    setMessages(buildInitialMessages());
    setStepIndex(0);
    setSelections({});
    setStatus("asking");
  }, []);

  return {
    messages,
    options: currentStep ? currentStep.options : [],
    isSearching: status === "searching",
    isFinished: status === "done",
    selectOption,
    restart,
  };
}
