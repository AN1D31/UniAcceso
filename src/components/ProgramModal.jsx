import React, { useState } from "react";
import { X } from "lucide-react";

const PROGRAM_LEVELS = ["Técnico", "Tecnólogo", "Pregrado", "Especialización", "Maestría", "Doctorado", "Posgrado"];
const PROGRAM_MODALITIES = ["Presencial", "Virtual", "A distancia"];

const EMPTY_FORM = { name: "", level: "Pregrado", modality: "Presencial", duration: "", description: "", url: "" };

const inputClasses =
  "w-full p-3 bg-white border border-gray-300 rounded-sm outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 transition-colors text-sm text-gray-800";
const labelClasses = "block mb-1 text-xs font-semibold text-gray-700 uppercase tracking-wider";

// Builds the form state from an existing program (edit mode) or empty defaults (create mode).
const buildInitialForm = (program) =>
  program
    ? {
        name: program.name ?? "",
        level: program.level ?? EMPTY_FORM.level,
        modality: program.modality ?? EMPTY_FORM.modality,
        duration: program.duration ?? "",
        description: program.description ?? "",
        url: program.url ?? "",
      }
    : EMPTY_FORM;

// Controlled modal used for both creating and editing a program.
// `program` is null in create mode. Mount it with a `key` so the form resets for each program.
const ProgramModal = ({ program, isSaving, onSubmit, onClose }) => {
  const [form, setForm] = useState(() => buildInitialForm(program));
  const isEditing = Boolean(program);

  // Keep legacy values that are not in the standard lists selectable when editing.
  const levels = PROGRAM_LEVELS.includes(form.level) ? PROGRAM_LEVELS : [form.level, ...PROGRAM_LEVELS];
  const modalities = PROGRAM_MODALITIES.includes(form.modality) ? PROGRAM_MODALITIES : [form.modality, ...PROGRAM_MODALITIES];

  const handleChange = (event) => {
    setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="program-modal-title"
    >
      <div
        className="bg-white p-6 md:p-8 max-w-xl w-full relative max-h-[90vh] overflow-y-auto border border-gray-200"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-5 right-5 w-8 h-8 rounded-sm bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 id="program-modal-title" className="text-xl font-semibold mb-6 text-gray-900 text-center">
          {isEditing ? "Editar Programa" : "Añadir Programa"}
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label htmlFor="program-name" className={labelClasses}>Nombre del programa</label>
            <input id="program-name" type="text" name="name" value={form.name} onChange={handleChange} required className={inputClasses} />
          </div>

          <div>
            <label htmlFor="program-level" className={labelClasses}>Nivel</label>
            <select id="program-level" name="level" value={form.level} onChange={handleChange} className={inputClasses}>
              {levels.map((level) => <option key={level} value={level}>{level}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="program-modality" className={labelClasses}>Modalidad</label>
            <select id="program-modality" name="modality" value={form.modality} onChange={handleChange} className={inputClasses}>
              {modalities.map((modality) => <option key={modality} value={modality}>{modality}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label htmlFor="program-duration" className={labelClasses}>Duración (semestres)</label>
            <input id="program-duration" type="number" name="duration" min="1" step="1" value={form.duration} onChange={handleChange} className={inputClasses} />
          </div>

          <div className="col-span-2">
            <label htmlFor="program-description" className={labelClasses}>Descripción</label>
            <textarea id="program-description" name="description" rows="3" value={form.description} onChange={handleChange} className={`${inputClasses} resize-none`} />
          </div>

          <div className="col-span-2">
            <label htmlFor="program-url" className={labelClasses}>Enlace oficial</label>
            <input id="program-url" type="url" name="url" placeholder="https://" value={form.url} onChange={handleChange} className={inputClasses} />
          </div>

          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-sm hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} className="px-5 py-2.5 bg-purple-700 text-white font-semibold rounded-sm hover:bg-purple-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {isSaving ? "Guardando..." : isEditing ? "Guardar cambios" : "Añadir programa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProgramModal;
