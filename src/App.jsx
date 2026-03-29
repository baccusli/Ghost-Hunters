import Board from "./Board";
import Tray from "./Tray";
import { ghosts } from "./Ghosts";

export default function App() {
  return (
    <div className="app">
      <h1 className="title">Ghost Hunters</h1>
      <Board ghosts={ghosts} />
      <Tray />
    </div>
  );
}