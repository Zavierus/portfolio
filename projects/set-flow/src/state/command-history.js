function assertCommand(command) {
  if (!command || typeof command.do !== "function" || typeof command.undo !== "function") {
    throw new TypeError("A command must provide do() and undo() functions");
  }
}

export function createCommandHistory({ limit = 100 } = {}) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError("History limit must be a positive integer");
  }

  const undoStack = [];
  const redoStack = [];

  return {
    execute(command) {
      assertCommand(command);
      command.do();
      undoStack.push(command);
      if (undoStack.length > limit) undoStack.shift();
      redoStack.length = 0;
      return true;
    },

    undo() {
      const command = undoStack.pop();
      if (!command) return false;
      try {
        command.undo();
        redoStack.push(command);
      } catch (error) {
        undoStack.push(command);
        throw error;
      }
      return true;
    },

    redo() {
      const command = redoStack.pop();
      if (!command) return false;
      try {
        command.do();
        undoStack.push(command);
      } catch (error) {
        redoStack.push(command);
        throw error;
      }
      return true;
    },

    canUndo() {
      return undoStack.length > 0;
    },

    canRedo() {
      return redoStack.length > 0;
    },

    clear() {
      undoStack.length = 0;
      redoStack.length = 0;
    },

    snapshot() {
      return {
        undoDepth: undoStack.length,
        redoDepth: redoStack.length,
        undoLabel: undoStack.at(-1)?.label || null,
        redoLabel: redoStack.at(-1)?.label || null,
      };
    },
  };
}
