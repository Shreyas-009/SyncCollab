import React, { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { CircleDashed, CheckCircle2 } from "lucide-react";
import TaskColumn from "./TaskColumnPreview";

// Mock assignees to populate the user filter
const MOCK_ASSIGNEES = [
  { id: "u1", name: "Alex R." },
  { id: "u2", name: "Sam C." },
  { id: "u3", name: "Jordan L." },
];

// Dummy tasks for preview with descriptions added
const INITIAL_TASKS = {
  pending: [
    {
      _id: "1",
      title: "Design Landing Page Hero",
      description:
        "Create a high-fidelity mockup for the new SyncCollab OS workspace showcase with detailed components.",
      priority: "high",
      status: "pending",
      taskType: "design",
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      assignedTo: "u1",
      assignedToName: "Alex R.",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "2",
      title: "Setup Authentication",
      description:
        "Integrate Clerk provider and implement login, signup, and user profile management pages.",
      priority: "medium",
      status: "pending",
      taskType: "feature",
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      assignedTo: "u2",
      assignedToName: "Sam C.",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "3",
      title: "Write API Documentation",
      description:
        "Document all new REST endpoints for the team using Swagger or Postman collections.",
      priority: "low",
      status: "pending",
      taskType: "documentation",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      assignedTo: "u3",
      assignedToName: "Jordan L.",
      createdAt: new Date().toISOString(),
    },
  ],
  completed: [
    {
      _id: "4",
      title: "Fix mobile navigation bug",
      description:
        "Resolve the issue where the sidebar menu overlaps content on screens smaller than 768px.",
      priority: "high",
      status: "completed",
      taskType: "bug-fix",
      dueDate: new Date().toISOString(),
      assignedTo: "u1",
      assignedToName: "Alex R.",
      createdAt: new Date().toISOString(),
    },
  ],
};

export const KanbanPreview = () => {
  const [columns, setColumns] = useState(INITIAL_TASKS);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = [...columns[source.droppableId]];
      const destColumn = [...columns[destination.droppableId]];
      const [removed] = sourceColumn.splice(source.index, 1);
      removed.status = destination.droppableId;
      destColumn.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn,
      });
    } else {
      const column = [...columns[source.droppableId]];
      const [removed] = column.splice(source.index, 1);
      column.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: column,
      });
    }
  };

  return (
    <div className="kanban-preview w-full h-[550px] overflow-hidden bg-stone-50 dark:bg-[#0c0c0e] rounded-2xl border border-stone-200 dark:border-white/5 shadow-xl p-2 md:p-6 flex items-start justify-center">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .kanban-preview *::-webkit-scrollbar { display: none; }
            .kanban-preview * { -ms-overflow-style: none; scrollbar-width: none; }
        `,
        }}
      />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 md:gap-6 overflow-x-auto w-full justify-center max-w-5xl h-full items-stretch">
          <div className="w-[280px] md:w-80 shrink-0 h-full">
            <TaskColumn
              title="Pending"
              statusId="pending"
              icon={<CircleDashed className="w-4 h-4 text-amber-500" />}
              tasks={columns.pending}
              projectAssignees={MOCK_ASSIGNEES}
              isTaskBusy={() => false}
              isLoading={false}
              onDelete={() => {}}
              onEdit={() => {}}
              onView={() => {}}
              onComments={() => {}}
            />
          </div>
          <div className="w-[280px] md:w-80 shrink-0 hidden sm:block h-full">
            <TaskColumn
              title="Completed"
              statusId="completed"
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              tasks={columns.completed}
              projectAssignees={MOCK_ASSIGNEES}
              isTaskBusy={() => false}
              isLoading={false}
              onDelete={() => {}}
              onEdit={() => {}}
              onView={() => {}}
              onComments={() => {}}
            />
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanPreview;
