// AnyMessage.tsx
import { StreamingLog } from "../multimodal-live-types";

type Message = { message: StreamingLog["message"] };

const AnyMessage = ({ message }: Message) => (
    <pre>{JSON.stringify(message, null, "  ")}</pre>
  );

export default AnyMessage