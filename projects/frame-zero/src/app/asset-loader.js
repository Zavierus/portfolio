export function createAssetLoader(groups) {
  const orderedGroups = [...groups];

  return {
    async loadAll(onProgress = () => {}) {
      const total = orderedGroups.length;
      for (let index = 0; index < total; index += 1) {
        const group = orderedGroups[index];
        onProgress({ stage: group.id, completed: index, total });
        await group.load();
        onProgress({ stage: group.id, completed: index + 1, total });
      }
    },
  };
}

