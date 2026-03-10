import React, { useState, useEffect, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { DragDropContext } from '@hello-pangea/dnd'

import TaskColumn from '../components/TaskColumn'
import ProjectSidebar from '../components/ProjectSidebar'
import RequestsPage from '../components/RequestsPage'
import Header from '../components/Header'
import TaskForm from '../components/TaskForm'
import UpdateForm from '../components/UpdateForm'
import DeleteConfirmation from '../components/DeleteConfirmation'
import ViewTaskModal from '../components/ViewTaskModal'
import DragConfirmModal from '../components/DragConfirmModal'
import PageTransition from '../components/PageTransition'
import ProjectsHub from '../components/ProjectsHub'
import ActivityPage from '../components/ActivityPage'
import NexusPage from '../components/NexusPage'
import MembersPage from '../components/MembersPage'
import InviteModal from '../components/InviteModal'
import ProjectSettingsModal from '../components/ProjectSettingsModal'
import useMutationLocks from '../hooks/useMutationLocks'

import Todo from '../assets/todo.png'
import doing from '../assets/doing.png'
import completed from '../assets/completed.png'

import { fetchTasks, addTask, deleteTask, searchTasks, updateTask, setAuthFunctions, fetchProjects, createProject } from '../utils/api'
import { useTheme as _useTheme } from '../context/useTheme'

const HomePage = () => {
    // Project & Sidebar State
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768)
    const [projects, setProjects] = useState([])
    const [selectedProject, setSelectedProject] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState('hub') // 'hub' | 'board' | 'activity' | 'nexus' | 'members'

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setSidebarOpen(true)
            else setSidebarOpen(false)
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Global UI State
    const [showForm, setShowForm] = useState(false)
    const [showRequests, setShowRequests] = useState(false)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [showSettingsModal, setShowSettingsModal] = useState(false)

    // Tasks State
    const [tasks, setTasks] = useState([])

    // Global Modals State
    const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null)
    const [selectedTaskForDelete, setSelectedTaskForDelete] = useState(null)
    const [selectedTaskForView, setSelectedTaskForView] = useState(null)
    const [pendingDragAction, setPendingDragAction] = useState(null)

    const { user } = useUser()
    const { getToken } = useAuth()
    const { runLocked, isLocked } = useMutationLocks()

    const taskCreateKey = 'task:create'
    const projectCreateKey = 'project:create'
    const taskDeleteKey = (taskId) => `task:delete:${taskId}`
    const taskUpdateKey = (taskId) => `task:update:${taskId}`
    const taskMoveKey = (taskId) => `task:move:${taskId}`

    useEffect(() => {
        setAuthFunctions(
            () => getToken(),
            () => user?.id
        )
    }, [getToken, user])

    const loadProjects = useCallback(async () => {
        try {
            const data = await fetchProjects()
            setProjects(data || [])
            setLoading(false)
            return data || []
        } catch (err) {
            console.error('Error loading projects:', err)
            setProjects([])
            setLoading(false)
            return []
        }
    }, [])

    const loadTasks = useCallback(async () => {
        if (!selectedProject?._id) return
        try {
            const data = await fetchTasks(selectedProject._id)
            setTasks(data || [])
        } catch (err) {
            console.error('Error loading tasks:', err)
            setTasks([])
        }
    }, [selectedProject?._id])

    useEffect(() => {
        if (user) loadProjects()
    }, [user, loadProjects])

    useEffect(() => {
        if (selectedProject) {
            loadTasks()
        } else {
            setTasks([])
            setCurrentPage('hub')
        }
    }, [selectedProject, loadTasks])

    const handleSelectProject = (project) => {
        setSelectedProject(project)
        if (project) {
            setCurrentPage('board')
        } else {
            setCurrentPage('hub')
        }
    }

    const handleNavigate = (page) => {
        setCurrentPage(page)
    }

    const handleCreateProject = async (projectData) => {
        try {
            const { executed, value: newProject } = await runLocked(projectCreateKey, async () => {
                const createdProject = await createProject(projectData)
                await loadProjects()
                setSelectedProject(createdProject)
                setCurrentPage('board')
                return createdProject
            })

            return executed && !!newProject
        } catch (err) {
            console.error('Error creating project:', err)
            alert('Error creating project')
            return false
        }
    }

    const handleAddTask = async (newTask) => {
        if (!selectedProject) {
            alert('Please select or create a project first')
            return false
        }
        try {
            const { executed } = await runLocked(taskCreateKey, async () => {
                const result = await addTask({
                    ...newTask,
                    projectId: selectedProject._id
                })
                if (result) {
                    await loadTasks()
                    setShowForm(false)
                }
            })
            return executed
        } catch (err) {
            const msg = err.response?.data?.message || 'Error adding task.'
            alert(msg)
            return false
        }
    }

    const handleDeleteTask = async (taskId) => {
        try {
            const { executed } = await runLocked(taskDeleteKey(taskId), async () => {
                await deleteTask(taskId)
                await loadTasks()
                setSelectedTaskForDelete(null)
            })
            return executed
        } catch (err) {
            const msg = err.response?.data?.message || 'Error deleting task.'
            alert(msg)
            return false
        }
    }

    const handleSearch = useCallback(async (query) => {
        if (!selectedProject?._id) return
        try {
            if (!query.trim()) { await loadTasks(); return }
            const data = await searchTasks(query, selectedProject._id)
            setTasks(data || [])
        } catch (err) { console.error('Search error:', err) }
    }, [selectedProject?._id, loadTasks])

    const handleUpdateTask = async (taskId, updatedData) => {
        try {
            const { executed } = await runLocked(taskUpdateKey(taskId), async () => {
                await updateTask(taskId, updatedData)
                await loadTasks()
                setSelectedTaskForEdit(null)
            })
            return executed
        } catch (err) {
            const msg = err.response?.data?.message || 'Error updating task.'
            alert(msg)
            return false
        }
    }

    const handleInviteAccepted = () => {
        loadProjects()
        setShowRequests(false)
    }

    // Drag and Drop Logic
    const handleDragEnd = (result) => {
        const { source, destination, draggableId } = result
        if (!destination) return
        if (source.droppableId === destination.droppableId && source.index === destination.index) return
        const task = tasks.find(t => t._id === draggableId)
        if (!task) return
        if (isTaskBusy(task._id)) return
        if (source.droppableId !== destination.droppableId) {
            setPendingDragAction({ task, source, destination, newStatus: destination.droppableId })
        }
    }

    const confirmDrag = async () => {
        if (!pendingDragAction) return
        const { task, newStatus } = pendingDragAction
        try {
            const { executed } = await runLocked(taskMoveKey(task._id), async () => {
                setTasks((currentTasks) => currentTasks.map((t) => (
                    t._id === task._id ? { ...t, status: newStatus } : t
                )))
                await updateTask(task._id, { status: newStatus })
                await loadTasks()
            })
            if (!executed) return
            setPendingDragAction(null)
        } catch {
            alert('Error moving task')
            await loadTasks()
            setPendingDragAction(null)
        }
    }

    const cancelDrag = () => setPendingDragAction(null)

    const isTaskBusy = useCallback((taskId) => (
        isLocked(taskDeleteKey(taskId)) ||
        isLocked(taskUpdateKey(taskId)) ||
        isLocked(taskMoveKey(taskId))
    ), [isLocked])

    // Derived states
    const pendingTasks = tasks.filter(t => t.status === 'pending')
    const inProgressTasks = tasks.filter(t => t.status === 'in progress')
    const testingTasks = tasks.filter(t => t.status === 'testing')
    const completedTasks = tasks.filter(t => t.status === 'completed')

    const projectAssignees = selectedProject ? [
        { id: selectedProject.ownerId, name: selectedProject.ownerName || 'Owner' },
        ...(selectedProject.collaborators || []).map(c => ({ id: c.id, name: c.name || c.email }))
    ] : []

    // Which page to show?
    const showHub = currentPage === 'hub'
    const showBoard = currentPage === 'board' && !!selectedProject
    const showActivity = currentPage === 'activity' && !!selectedProject
    const showNexus = currentPage === 'nexus' && !!selectedProject
    const showMembers = currentPage === 'members' && !!selectedProject

    return (
        <>
            <div className="flex h-screen transition-colors duration-300 bg-stone-50 dark:bg-slate-900 font-sans overflow-hidden">
                {/* Project Sidebar */}
                <ProjectSidebar
                    projects={projects}
                    selectedProject={selectedProject}
                    onSelectProject={handleSelectProject}
                    onCreateProject={handleCreateProject}
                    isOpen={sidebarOpen}
                    onToggle={() => setSidebarOpen(!sidebarOpen)}
                    onShowRequests={() => setShowRequests(true)}
                    currentPage={currentPage}
                    onNavigate={handleNavigate}
                    onShowSettings={() => setShowSettingsModal(true)}
                    onShowInvite={() => setShowInviteModal(true)}
                />

                {/* Requests Panel Overlay (simplified) */}
                {showRequests && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-end">
                        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setShowRequests(false)} />
                        <div className="relative w-80 h-full border-l border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-300">
                            <RequestsPage
                                onClose={() => setShowRequests(false)}
                                onInviteAccepted={handleInviteAccepted}
                            />
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    {/* Header — shown when in a project view, or a custom one for hub */}
                    {selectedProject ? (
                        <Header
                            onOpen={() => setShowForm(true)}
                            onSearch={handleSearch}
                            selectedProject={selectedProject}
                            onProjectsUpdated={loadProjects}
                            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                            currentPage={currentPage}
                        />
                    ) : (
                        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b bg-white border-stone-200/60 shadow-sm dark:bg-slate-900 dark:border-slate-800 z-30 h-[72px] shrink-0">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="md:hidden p-2 -ml-2 rounded-xl text-stone-600 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                                <h1 className="text-lg font-bold text-stone-800 dark:text-slate-100 tracking-tight">Project Hub</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <ThemeToggle />
                            </div>
                        </div>
                    )}

                    {/* Page Rendering */}
                    {loading ? (
                        <PageTransition pageKey="loading">
                            <div className="flex-1 flex items-center justify-center bg-stone-50/10 dark:bg-slate-950/10">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mb-4" />
                                    <p className="text-base font-semibold text-stone-500 dark:text-slate-400">Loading workspace...</p>
                                </div>
                            </div>
                        </PageTransition>
                    ) : showHub ? (
                        <PageTransition pageKey="hub">
                            <ProjectsHub
                                projects={projects}
                                onSelectProject={handleSelectProject}
                                onCreateProject={handleCreateProject}
                                onProjectsUpdated={loadProjects}
                                loading={loading}
                                isCreatingProject={isLocked(projectCreateKey)}
                            />
                        </PageTransition>
                    ) : showBoard ? (
                        <PageTransition pageKey={`board-${selectedProject._id}`}>
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <main className="flex-1 flex py-6 px-[2%] gap-5 overflow-x-auto custom-scrollbar bg-stone-50/10 dark:bg-slate-950/10">
                                    <div className="flex gap-5 h-full pb-4">
                                        <TaskColumn title='Pending' statusId='pending' img={Todo} tasks={pendingTasks} onDelete={setSelectedTaskForDelete} onEdit={setSelectedTaskForEdit} onView={setSelectedTaskForView} projectAssignees={projectAssignees} isTaskBusy={isTaskBusy} />
                                        <TaskColumn title='In Progress' statusId='in progress' img={doing} tasks={inProgressTasks} onDelete={setSelectedTaskForDelete} onEdit={setSelectedTaskForEdit} onView={setSelectedTaskForView} projectAssignees={projectAssignees} isTaskBusy={isTaskBusy} />
                                        <TaskColumn title='Testing' statusId='testing' img={null} tasks={testingTasks} onDelete={setSelectedTaskForDelete} onEdit={setSelectedTaskForEdit} onView={setSelectedTaskForView} projectAssignees={projectAssignees} isTaskBusy={isTaskBusy} />
                                        <TaskColumn title='Completed' statusId='completed' img={completed} tasks={completedTasks} onDelete={setSelectedTaskForDelete} onEdit={setSelectedTaskForEdit} onView={setSelectedTaskForView} projectAssignees={projectAssignees} isTaskBusy={isTaskBusy} />
                                    </div>
                                </main>
                            </DragDropContext>
                        </PageTransition>
                    ) : showActivity ? (
                        <PageTransition pageKey={`activity-${selectedProject._id}`}>
                            <ActivityPage selectedProject={selectedProject} getToken={getToken} />
                        </PageTransition>
                    ) : showNexus ? (
                        <PageTransition pageKey={`nexus-${selectedProject._id}`}>
                            <NexusPage selectedProject={selectedProject} />
                        </PageTransition>
                    ) : showMembers ? (
                        <PageTransition pageKey={`members-${selectedProject._id}`}>
                            <MembersPage 
                                selectedProject={selectedProject} 
                                onProjectUpdated={async (updatedProject) => {
                                    if (updatedProject?._id) {
                                        setProjects((currentProjects) => currentProjects.map((project) => (
                                            project._id === updatedProject._id ? updatedProject : project
                                        )))
                                        setSelectedProject(updatedProject)
                                        return
                                    }

                                    const refreshedProjects = await loadProjects()
                                    const refreshedProject = refreshedProjects.find((project) => project._id === selectedProject._id)
                                    if (refreshedProject) {
                                        setSelectedProject(refreshedProject)
                                    }
                                }} 
                                onShowInvite={() => setShowInviteModal(true)}
                            />
                        </PageTransition>
                    ) : null}
                </div>
            </div>

            {/* Global Modals */}
            <TaskForm
                show={showForm}
                onClose={() => setShowForm(false)}
                onAddTask={handleAddTask}
                project={selectedProject}
                isSubmitting={isLocked(taskCreateKey)}
            />

            {selectedTaskForDelete && (
                <DeleteConfirmation
                    show={true}
                    onClose={() => setSelectedTaskForDelete(null)}
                    onConfirm={() => handleDeleteTask(selectedTaskForDelete._id)}
                    taskTitle={selectedTaskForDelete.title}
                    isProcessing={isLocked(taskDeleteKey(selectedTaskForDelete._id))}
                />
            )}

            {selectedTaskForEdit && (
                <UpdateForm
                    show={true}
                    onClose={() => setSelectedTaskForEdit(null)}
                    task={selectedTaskForEdit}
                    onUpdate={handleUpdateTask}
                    project={selectedProject}
                    isSubmitting={isLocked(taskUpdateKey(selectedTaskForEdit._id))}
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
                newStatus={pendingDragAction?.newStatus}
                onConfirm={confirmDrag}
                onCancel={cancelDrag}
                isProcessing={pendingDragAction ? isLocked(taskMoveKey(pendingDragAction.task._id)) : false}
            />

            {showInviteModal && selectedProject && (
                <InviteModal 
                    show={true}
                    onClose={() => setShowInviteModal(false)}
                    project={selectedProject}
                />
            )}

            {showSettingsModal && selectedProject && (
                <ProjectSettingsModal
                    show={true}
                    onClose={() => setShowSettingsModal(false)}
                    project={selectedProject}
                    onProjectUpdated={() => { loadProjects(); setShowSettingsModal(false); }}
                />
            )}
        </>
    )
}

const ThemeToggle = () => {
    const { isDark, toggleTheme } = _useTheme()
    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors text-stone-500 hover:bg-stone-100 dark:text-amber-400 dark:hover:bg-slate-800"
            title="Toggle theme"
        >
            {isDark ? (
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    )
}

export default HomePage
