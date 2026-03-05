import React, { useState, useEffect, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import TaskColumn from '../components/TaskColumn'
import ProjectSidebar from '../components/ProjectSidebar'
import RequestsPage from '../components/RequestsPage'
import Todo from '../assets/todo.png';
import doing from '../assets/doing.png';
import completed from '../assets/completed.png';
import Header from '../components/Header';
import TaskForm from '../components/TaskForm';
import { fetchTasks, addTask, deleteTask, searchTasks, updateTask, setAuthFunctions, fetchProjects, createProject } from '../utils/api';
import { useTheme } from '../context/useTheme';

const HomePage = () => {
    const [showForm, setShowForm] = useState(false);
    const [showRequests, setShowRequests] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);
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
        } catch (err) {
            const msg = err.response?.data?.message || 'Error updating task.';
            alert(msg);
        }
    };

    const handleInviteAccepted = () => {
        loadProjects();
        setShowRequests(false);
    };

    const pendingTasks = tasks.filter(task => task.status === 'pending');
    const inProgressTasks = tasks.filter(task => task.status === 'in progress');
    const completedTasks = tasks.filter(task => task.status === 'completed');

    return (
        <>
            <div className={`flex h-screen transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-stone-100'}`}>
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
                    <div className={`w-80 border-r ${isDark ? 'border-slate-700' : 'border-stone-200'}`}>
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
                    />

                    <main className={`flex-1 flex justify-evenly py-6 px-[5%] gap-4 overflow-auto ${isDark ? 'bg-slate-950' : 'bg-stone-100'}`}>
                        {loading ? (
                            <div className={`flex items-center justify-center w-full ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                                <p className="text-lg">Loading...</p>
                            </div>
                        ) : !selectedProject ? (
                            <div className={`flex flex-col items-center justify-center w-full ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                <p className="text-lg font-medium mb-2">No project selected</p>
                                <p className="text-sm">Create or select a project to get started</p>
                            </div>
                        ) : (
                            <>
                                <TaskColumn title='Pending' img={Todo} tasks={pendingTasks} onDelete={handleDeleteTask} onUpdate={handleUpdateTask} />
                                <TaskColumn title='In Progress' img={doing} tasks={inProgressTasks} onDelete={handleDeleteTask} onUpdate={handleUpdateTask} />
                                <TaskColumn title='Completed' img={completed} tasks={completedTasks} onDelete={handleDeleteTask} onUpdate={handleUpdateTask} />
                            </>
                        )}
                    </main>
                </div>
            </div>

            <TaskForm
                show={showForm}
                onClose={() => setShowForm(false)}
                onAddTask={handleAddTask}
            />
        </>
    )
}

export default HomePage
