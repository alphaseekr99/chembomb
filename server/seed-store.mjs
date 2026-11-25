import { courseBank } from './course.mjs';
import { sourceMaterials } from './materials.mjs';

const baseline = {
  questions: new Map(courseBank.map(question => [question.id, question])),
  materials: new Map(sourceMaterials.map(material => [material.id, material]))
};

export function withCourseContent(store) {
  return {
    ...store,
    async list(table, status) {
      const merged = new Map(baseline[table]);
      for (const entry of await store.list(table)) {
        if (entry.deleted) merged.delete(entry.id);
        else merged.set(entry.id, entry);
      }
      return [...merged.values()].filter(entry => !status || entry.status === status);
    },
    async removeQuestion(id) {
      if (baseline.questions.has(id)) {
        await store.put('questions', { id, status: 'draft', deleted: true });
      } else await store.removeQuestion(id);
    }
  };
}
