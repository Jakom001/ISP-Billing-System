import React, { createContext, useContext, useEffect, useCallback, useMemo, useState } from 'react';
import { taskService } from '../service/taskService';
import { useAuthContext } from './AuthContext';
import { useProjectContext } from './ProjectContext';
import { toast } from 'react-toastify';

// Create the context
const TaskContext = createContext(null);

// Custom hook to use the context
function useTaskContext() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
}

// Provider component
function TaskContextProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuthContext();
  const {projects} = useProjectContext();
  
  // All Tasks
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await taskService.getTasks();

    if (result.data) {
      setTasks(result.data);
    } else {
      setError(result.error);
      toast.error(result.error, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });

    }
    
    setLoading(false);
    return result;
  }, []);


  // Get Task By ID
  const getSingleTask = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    const result = await taskService.getTaskById(id);
    
    setLoading(false);
    if (result.error) {
      setError(result.error);
      toast.error(result.error, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
    }
    
    return result;
  }, []);

  // Create task with user ID
  const addTask = useCallback(async (taskData) => {
    setLoading(true);
    setError(null);
    
    // check if user is authenticated
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must be logged in to add a task";
      setError(errorMsg);
      toast.error(errorMsg, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
      return { data: null, error: errorMsg };
    }
    
   
    const result = await taskService.addTask(taskData);
    setLoading(false);
    
    if (result.data) {
      // Find the project object that matches the projectId
      const projectObj = projects.find(pro => pro._id === taskData.projectId);

      // Add the new task with the full project object to the tasks list
      const newTask = {
        ...result.data,
        project: projectObj || { title: "Loading..." } // Fallback in case project isn't found
      };
    

      setTasks(prevTasks => [newTask, ...prevTasks]);
    } else {
      setError(result.error);
    }
    
    return result;
  }, [currentUser, projects]);

  // Update task
  const updateTask = useCallback(async (id, taskData) => {
    const previousTasks = [...tasks];

    // Get the project object for the new projectId if it's being updated
    const projectObj = taskData.projectId 
      ? projects.find(pro => pro._id === taskData.projectId)
      : null;

    // Optimistic update
    setTasks(prevTasks =>
      prevTasks.map(task =>
      {if (task._id === id) {
          return { 
            ...task, 
            ...taskData,
            // Keep existing project if not being updated, otherwise use the new one
            project: projectObj || task.project
          };
        }
        return task;
      }
      )
    );
    
    setLoading(true);
    setError(null);

    // check if user is logged in
    if(!currentUser){
      setLoading(false);
      const errorMsg = "You must login to update a task";
      setError(errorMsg);
      toast.error(errorMsg, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
      return { data: null, error: errorMsg };
    }

    const result = await taskService.updateTask(id, taskData);
    
    setLoading(false);

    if (result.data) {

      const updatedTask = {
        ...result.data,
        project: projectObj || 
                 tasks.find(t => t._id === id)?.project || 
                 { title: "Loading..." }
      };
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === id ? updatedTask : task
        )
      );

    } else {
      setTasks(previousTasks);
      setError(result.error);
      toast.error(result.error, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
    }
    
    return result;
  }, [tasks, currentUser, projects]);

  // Delete task
  const deleteTask = useCallback(async (id) => {
    const previousTasks = [...tasks];

    // Optimistic update
    setTasks(prevTasks =>
      prevTasks.filter(task => task._id !== id)
    );
    
    setLoading(true);
    setError(null);
    
    const result = await taskService.deleteTask(id);
    
    setLoading(false);
    if (!result.error) {
          toast.success("Task deleted successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }else{
      // Revert to previous state if there was an error
      setTasks(previousTasks);
      setError(result.error);
      toast.error(result.error, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
    }
    
    return result;
  }, [tasks]);

  // Search tasks
  const searchTasks = useCallback(async (searchTerm) => {
    if (!searchTerm.trim()) {
      return { data: tasks, error: null };
    }
    
    setLoading(true);
    setError(null);
    
    const result = await taskService.searchTask(searchTerm);
    
    setLoading(false);

    if (result.error) {
      setError(result.error);
      toast.error(result.error, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
    }
    
    return result;
  }, [tasks]);

  // Clear any errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
    
    return () => {
      // Any cleanup if needed
    };
  }, [fetchTasks]);


  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    tasks,
    loading,
    error,
    clearError,
    fetchTasks,
    updateTask,
    deleteTask,
    addTask,
    getSingleTask,
    searchTasks,
    
  }), [
    tasks,
    loading,
    error,
    clearError,
    fetchTasks,
    updateTask,
    deleteTask,
    addTask,
    getSingleTask,
    searchTasks,
  ]);

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

// Export both the hook and provider
export { useTaskContext, TaskContextProvider };