import React, { useState, useEffect, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { DragDropContext } from '@hello-pangea/dnd'

import TaskColumn from '../components/TaskColumn'
import ProjectSidebar from '../components/ProjectSidebar'
import RequestsPage from '../components/RequestsPage'
import Header from '../components/Header';
import TaskForm from '../components/TaskForm';
import ChatInterface from '../components/ChatInterface';
import UpdateForm from '../components/UpdateForm';
import DeleteConfirmation from '../components/DeleteConfirmation';
import ViewTaskModal from '../components/ViewTaskModal';
import DragConfirmModal from '../components/DragConfirmModal';

import Todo from '../assets/todo.png';
import doing from '../assets/doing.png';
import completed from '../assets/completed.png';

import { fetchTasks, addTask, deleteTask, searchTasks, updateTask, setAuthFunctions, fetchProjects, createProject } from '../utils/api';
import { useTheme } from '../context/useTheme';

const HomePage = () => {
    // Project & Sidebar State
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Global UI State
    const [showForm, setShowForm] = useState(false);
    const [showRequests, setShowRequests] = useState(false);
    const [showChat, setShowChat] = useState(false);
    
    // Tasks State
    const [tasks, setTasks] = useState([]);
    
    // Global Modals State
    const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
    const [selectedTaskForDelete, setSelectedTaskForDelete] = useState(null);
    const [selectedTaskForView, setSelectedTaskForView] = useState(null);
    const [pendingDragAction, setPendingDragAction] = useState(null);

    const { isDark } = useTheme();
    const { user } = useUser();
    const { getToken } = useAuth();

    // Set up auth functions for API calls
    useEffect(() => {
        setAuthFunctions(
            () => getToken(),
            () => user?.id
        );
    }, [getToken, user]);

    const loadProjects = useCallback(async () => {
        try {
            const data = await fetchProjects();
            setProjects(data || []);
            // Auto-select first project if none selected
            if (data && data.length > 0 && !selectedProject) {
                setSelectedProject(data[0]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error loading projects:', err);
            setProjects([]);
            setLoading(false);
        }
    }, [selectedProject]);

    const loadTasks = useCallback(async () => {
        if (!selectedProject) return;
        try {
            const data = await fetchTasks(selectedProject._id);
            setTasks(data || []);
        } catch (err) {
            console.error('Error loading tasks:', err);
            setTasks([]);
        }
    }, [selectedProject]);

    useEffect(() => {
        if (user) {
            loadProjects();
        }
    }, [user, loadProjects]);

    useEffect(() => {
        if (selectedProject) {
            loadTasks();
        } else {
            setTasks([]);
        }
    }, [selectedProject, loadTasks]);

    const handleCreateProject = async (projectData) => {
        try {
            const newProject = await createProject({
                ...projectData,
                ownerEmail: user?.emailAddresses?.[0]?.emailAddress || '',
                ownerName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                ownerImage: user?.imageUrl || ''
            });
            await loadProjects();
            setSelectedProject(newProject);
        } catch (err) {
            console.error('Error creating project:', err);
            alert('Error creating project');
        }
    };

    const handleAddTask = async (newTask) => {
        if (!selectedProject) {
            alert('Please select or create a project first');
            return;
        }
        try {
            const result = await addTask({
                ...newTask,
                projectId: selectedProject._id,
                createdByName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                createdByImage: user?.imageUrl || ''
            });
            if (result) {
                await loadTasks();
                setShowForm(false);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Error adding task.';
            alert(msg);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId);
            await loadTasks();
            setSelectedTaskForDelete(null);
        } catch (err) {
            const msg = err.response?.data?.message || 'Error deleting task.';
            alert(msg);
        }
    };

    const handleSearch = async (query) => {
        if (!selectedProject) return;
        try {
            if (!query.trim()) {
                await loadTasks();
                return;
            }
            const data = await searchTasks(query, selectedProject._id);
            setTasks(data || []);
        } catch (err) {
            console.error('Search error:', err);
        }
    };

    const handleUpdateTask = async (taskId, updatedData) => {
        try {
            await updateTask(taskId, {
                ...updatedData,
                updatedBy: user?.id,
                updatedByName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                updatedByImage: user?.imageUrl || ''
            });
            await loadTasks();
            setSelectedTaskForEdit(null);
        } catch (err) {
            const msg = err.response?.data?.message || 'Error updating task.';
            alert(msg);
        }
    };

    const handleInviteAccepted = () => {
        loadProjects();
        setShowRequests(false);
    };

    // Drag and Drop Logic
    const handleDragEnd = (result) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;
        
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const task = tasks.find(t => t._id === draggableId);
        if (!task) return;

        if (source.droppableId !== destination.droppableId) {
            setPendingDragAction({
                task,
                source,
                destination,
                newStatus: destination.droppableId
            });
        } else {
             // In the future: handle reordering in same column if supported
        }
    };

    const confirmDrag = async () => {
        if (!pendingDragAction) return;
        const { task, newStatus } = pendingDragAction;
        
        // Optimistic UI update
        const updatedTasks = tasks.map(t => {
            if (t._id === task._id) {
                return { ...t, status: newStatus };
            }
            return t;
        });
        setTasks(updatedTasks);
        setPendingDragAction(null);

        // API call
        try {
            await updateTask(task._id, {
                status: newStatus,
                updatedBy: user?.id,
                updatedByName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                updatedByImage: user?.imageUrl || ''
            });
            await loadTasks();
        } catch (err) {
            alert('Error moving task');
            await loadTasks(); // Rollback visual state if error
        }
    };

    const cancelDrag = () => {
        setPendingDragAction(null);
    };

    // Derived states for columns
    const pendingTasks = tasks.filter(task => task.status === 'pending');
    const inProgressTasks = tasks.filter(task => task.status === 'in progress');
    const testingTasks = tasks.filter(task => task.status === 'testing');
    const completedTasks = tasks.filter(task => task.status === 'completed');

    // Build project assignees list for filters
    const projectAssignees = selectedProject ? [
        { id: selectedProject.ownerId, name: selectedProject.ownerName || 'Owner' },
        ...(selectedProject.collaborators || []).map(c => ({ id: c.id, name: c.name || c.email }))
    ] : [];

    return (
        <>
            <div className="flex h-screen transition-colors duration-300 bg-stone-50 dark:bg-slate-900 font-sans">
                {/* Project Sidebar */}
                <ProjectSidebar
                    projects={projects}
                    selectedProject={selectedProject}
                    onSelectProject={setSelectedProject}
                    onCreateProject={handleCreateProject}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    onShowRequests={() => setShowRequests(true)}
                />

                {/* Requests Panel */}
                {showRequests && (
                    <div className="w-80 border-r border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <RequestsPage
                            onClose={() => setShowRequests(false)}
                            onInviteAccepted={handleInviteAccepted}
                        />
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header
                        onOpen={() => setShowForm(true)}
                        onSearch={handleSearch}
                        selectedProject={selectedProject}
                        onProjectsUpdated={loadProjects}
                        onOpenChat={() => setShowChat(true)}
                        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    />

                    {loading ? (
                        <main className="flex-1 flex items-center justify-center w-full bg-stone-50/50 dark:bg-slate-950/50">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mb-4"></div>
                                <p className="text-lg font-medium text-stone-500 dark:text-slate-400">Loading workspace...</p>
                            </div>
                        </main>
                    ) : !selectedProject ? (
                        <main className="flex-1 flex flex-col items-center justify-center w-full bg-stone-50/50 dark:bg-slate-950/50">
                            <svg className="w-20 h-20 mb-6 text-stone-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <p className="text-xl font-bold text-stone-700 dark:text-slate-300 mb-2">No project selected</p>
                            <p className="text-sm text-stone-500 dark:text-slate-500 max-w-sm text-center">Create a new project or select an existing one from the sidebar to start collaborating.</p>
                        </main>
                    ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <main className="flex-1 flex py-6 px-[2%] gap-5 overflow-x-auto custom-scrollbar bg-stone-50/30 dark:bg-slate-950/30">
                                <div className="flex gap-5 h-full pb-4">
                                    <TaskColumn title='Pending' statusId='pending' img={Todo} tasks={pendingTasks} onDelete={setSelectedTaskForDelete} onEdit={setSelectedTaskForEdit} onView={setSelectedTaskForView} projectAssignees={projectAssignees} />
                                    <TaskColumn title='In Progress' statusId='in progress' img={doing} tasks={inProgressTasks} onDelete={setSelectedTaskForDelete} onEdit={setSelectedTaskForEdit} onView={setSelectedTaskForView} projectAssignees={projectAssignees} />
                                    <TaskColumn title='Testing' statusId='testing' img={null} tasks={testingTasks} onDelete={setSelectedTaskForDelete} onEdit={setSelectedTaskForEdit} onView={setSelectedTaskForView} projectAssignees={projectAssignees} />
                                    <TaskColumn title='Completed' statusId='completed' img={completed} tasks={completedTasks} onDelete={setSelectedTaskForDelete} onEdit={setSelectedTaskForEdit} onView={setSelectedTaskForView} projectAssignees={projectAssignees} />
                                </div>
                            </main>
                        </DragDropContext>
                    )}
                </div>
                
                <ChatInterface 
                    isOpen={showChat} 
                    onClose={() => setShowChat(false)} 
                    selectedProject={selectedProject}
                />
            </div>

            {/* Global Modals */}
            <TaskForm
                show={showForm}
                onClose={() => setShowForm(false)}
                onAddTask={handleAddTask}
                project={selectedProject}
            />

            {selectedTaskForDelete && (
                <DeleteConfirmation
                    show={true}
                    onClose={() => setSelectedTaskForDelete(null)}
                    onConfirm={() => handleDeleteTask(selectedTaskForDelete._id)}
                    taskTitle={selectedTaskForDelete.title}
                />
            )}

            {selectedTaskForEdit && (
                <UpdateForm
                    show={true}
                    onClose={() => setSelectedTaskForEdit(null)}
                    task={selectedTaskForEdit}
                    onUpdate={handleUpdateTask}
                    project={selectedProject}
                />
            )}

            <ViewTaskModal 
                show={!!selectedTaskForView} 
                onClose={() => setSelectedTaskForView(null)} 
                task={selectedTaskForView} 
            />

            <DragConfirmModal 
                show={!!pendingDragAction}
                taskName={pendingDragAction?.task?.title}
                currentStatus={pendingDragAction?.task?.status}
                newStatus={pendingDragAction?.newStatus}
                onConfirm={confirmDrag}
                onCancel={cancelDrag}
            />
        </>
    )
}

export default HomePage;
