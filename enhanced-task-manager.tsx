"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { format, isToday, isTomorrow, isThisWeek, isAfter } from "date-fns"
import { CalendarIcon, Trash2, Plus, Folder, ChevronDown, Edit, Check, Download, Upload, User } from "lucide-react"

type Task = {
  id: string
  name: string
  description: string
  dueDate: Date | undefined
  completed: boolean
}

type List = {
  id: string
  name: string
  tasks: Task[]
}

type Folder = {
  id: string
  name: string
  emoji: string
  lists: List[]
}

type UserData = {
  id: string
  name: string
  image: string
  folders: Folder[]
}

export default function TaskManager() {
  const [users, setUsers] = useState<UserData[]>([])
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderEmoji, setNewFolderEmoji] = useState("")
  const [newListName, setNewListName] = useState("")
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: 'folder' | 'list' | 'task', id: string } | null>(null)
  const [editItem, setEditItem] = useState<{ type: 'folder' | 'list' | 'task', id: string } | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmoji, setEditEmoji] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDate, setEditDate] = useState<Date>()
  const [showAddFolder, setShowAddFolder] = useState(false)
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserName, setNewUserName] = useState("")
  const [newUserImage, setNewUserImage] = useState("")

  useEffect(() => {
    const savedUsers = localStorage.getItem('taskManagerUsers')
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers, (key, value) => {
        if (key === 'dueDate' && value) {
          return new Date(value)
        }
        return value
      }))
    }
    const savedTheme = localStorage.getItem('taskManagerTheme')
    if (savedTheme) {
      setTheme(savedTheme as "light" | "dark")
    }
    const savedCurrentUser = localStorage.getItem('taskManagerCurrentUser')
    if (savedCurrentUser) {
      setCurrentUser(savedCurrentUser)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('taskManagerUsers', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem('taskManagerTheme', theme)
  }, [theme])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('taskManagerCurrentUser', currentUser)
      const user = users.find(u => u.id === currentUser)
      if (user) {
        setFolders(user.folders)
      }
    }
  }, [currentUser, users])

  const addUser = () => {
    if (newUserName) {
      const newUser: UserData = {
        id: Date.now().toString(),
        name: newUserName,
        image: newUserImage || "/placeholder.svg?height=40&width=40",
        folders: []
      }
      setUsers([...users, newUser])
      setNewUserName("")
      setNewUserImage("")
      setShowAddUser(false)
      if (!currentUser) {
        setCurrentUser(newUser.id)
      }
    }
  }

  const addFolder = () => {
    if (newFolderName && currentUser) {
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: newFolderName,
        emoji: newFolderEmoji || "📁",
        lists: [],
      }
      const updatedUsers = users.map(user => 
        user.id === currentUser 
          ? { ...user, folders: [...user.folders, newFolder] }
          : user
      )
      setUsers(updatedUsers)
      setFolders([...folders, newFolder])
      setNewFolderName("")
      setNewFolderEmoji("")
      setShowAddFolder(false)
    }
  }

  const addList = () => {
    if (newListName && selectedFolder && currentUser) {
      const updatedUsers = users.map(user => {
        if (user.id === currentUser) {
          return {
            ...user,
            folders: user.folders.map(folder => {
              if (folder.id === selectedFolder) {
                return {
                  ...folder,
                  lists: [...folder.lists, { id: Date.now().toString(), name: newListName, tasks: [] }]
                }
              }
              return folder
            })
          }
        }
        return user
      })
      setUsers(updatedUsers)
      setFolders(updatedUsers.find(u => u.id === currentUser)?.folders || [])
      setNewListName("")
    }
  }

  const addTask = () => {
    if (newTaskName && selectedFolder && selectedList && currentUser) {
      const newTask: Task = {
        id: Date.now().toString(),
        name: newTaskName,
        description: newTaskDescription,
        dueDate: selectedDate,
        completed: false,
      }
      const updatedUsers = users.map(user => {
        if (user.id === currentUser) {
          return {
            ...user,
            folders: user.folders.map(folder => {
              if (folder.id === selectedFolder) {
                return {
                  ...folder,
                  lists: folder.lists.map(list => {
                    if (list.id === selectedList) {
                      return {
                        ...list,
                        tasks: [...list.tasks, newTask]
                      }
                    }
                    return list
                  })
                }
              }
              return folder
            })
          }
        }
        return user
      })
      setUsers(updatedUsers)
      setFolders(updatedUsers.find(u => u.id === currentUser)?.folders || [])
      setNewTaskName("")
      setNewTaskDescription("")
      setSelectedDate(undefined)
    }
  }

  const toggleTaskCompletion = (taskId: string) => {
    if (!currentUser) return
    const updatedUsers = users.map(user => {
      if (user.id === currentUser) {
        return {
          ...user,
          folders: user.folders.map(folder => ({
            ...folder,
            lists: folder.lists.map(list => ({
              ...list,
              tasks: list.tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              )
            }))
          }))
        }
      }
      return user
    })
    setUsers(updatedUsers)
    setFolders(updatedUsers.find(u => u.id === currentUser)?.folders || [])
  }

  const confirmDelete = () => {
    if (!itemToDelete || !currentUser) return

    const updatedUsers = users.map(user => {
      if (user.id === currentUser) {
        if (itemToDelete.type === 'folder') {
          return {
            ...user,
            folders: user.folders.filter(folder => folder.id !== itemToDelete.id)
          }
        } else if (itemToDelete.type === 'list' && selectedFolder) {
          return {
            ...user,
            folders: user.folders.map(folder => {
              if (folder.id === selectedFolder) {
                return {
                  ...folder,
                  lists: folder.lists.filter(list => list.id !== itemToDelete.id)
                }
              }
              return folder
            })
          }
        } else if (itemToDelete.type === 'task' && selectedFolder && selectedList) {
          return {
            ...user,
            folders: user.folders.map(folder => {
              if (folder.id === selectedFolder) {
                return {
                  ...folder,
                  lists: folder.lists.map(list => {
                    if (list.id === selectedList) {
                      return {
                        ...list,
                        tasks: list.tasks.filter(task => task.id !== itemToDelete.id)
                      }
                    }
                    return list
                  })
                }
              }
              return folder
            })
          }
        }
      }
      return user
    })

    setUsers(updatedUsers)
    setFolders(updatedUsers.find(u => u.id === currentUser)?.folders || [])
    setShowDeleteConfirm(false)
    setItemToDelete(null)
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const groupTasksByDueDate = (tasks: Task[]) => {
    const groups: { [key: string]: Task[] } = {
      "Overdue": [],
      "Today": [],
      "Tomorrow": [],
      "This Week": [],
      "Later": [],
      "No Due Date": []
    }

    const today = new Date()
    tasks.forEach(task => {
      if (!task.dueDate) {
        groups["No Due Date"].push(task)
      } else if (isToday(task.dueDate)) {
        groups["Today"].push(task)
      } else if (isTomorrow(task.dueDate)) {
        groups["Tomorrow"].push(task)
      } else if (isThisWeek(task.dueDate, { weekStartsOn: 1 })) {
        groups["This Week"].push(task)
      } else if (isAfter(today, task.dueDate)) {
        groups["Overdue"].push(task)
      } else {
        groups["Later"].push(task)
      }
    })

    return groups
  }

  const handleEdit = () => {
    if (!editItem || !currentUser) return

    const updatedUsers = users.map(user => {
      if (user.id === currentUser) {
        if (editItem.type === 'folder') {
          return {
            ...user,
            folders: user.folders.map(folder => 
              folder.id === editItem.id ? { ...folder, name: editName, emoji: editEmoji } : folder
            )
          }
        } else if (editItem.type === 'list' && selectedFolder) {
          return {
            ...user,
            folders: user.folders.map(folder => {
              if (folder.id === selectedFolder) {
                return {
                  ...folder,
                  lists: folder.lists.map(list => 
                    list.id === editItem.id ? { ...list, name: editName } : list
                  )
                }
              }
              return folder
            })
          }
        } else if (editItem.type === 'task' && selectedFolder && selectedList) {
          return {
            ...user,
            folders: user.folders.map(folder => {
              if (folder.id === selectedFolder) {
                return {
                  ...folder,
                  lists: folder.lists.map(list => {
                    if (list.id === selectedList) {
                      return {
                        ...list,
                        tasks: list.tasks.map(task => 
                          task.id === editItem.id ? { ...task, name: editName, description: editDescription, dueDate: editDate } : task
                        )
                      }
                    }
                    return list
                  })
                }
              }
              return folder
            })
          }
        }
      }
      return user
    })

    setUsers(updatedUsers)
    setFolders(updatedUsers.find(u => u.id === currentUser)?.folders || [])
    setEditItem(null)
    setEditName("")
    setEditEmoji("")
    setEditDescription("")
    setEditDate(undefined)
  }

  const exportData = (userId?: string) => {
    let dataToExport
    if (userId) {
      dataToExport = users.find(u => u.id === userId)
    } else {
      dataToExport = users
    }
    const dataStr = JSON.stringify(dataToExport)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = userId ? `task_manager_user_${userId}.json` : 'task_manager_all_users.json'

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result
        if (typeof content === 'string') {
          try {
            const importedData = JSON.parse(content, (key, value) => {
              if (key === 'dueDate' && value) {
                return new Date(value)
              }
              return value
            })
            if (Array.isArray(importedData)) {
              setUsers(importedData)
            } else {
              setUsers(prevUsers => [...prevUsers, importedData])
            }
          } catch (error) {
            console.error('Error parsing imported data:', error)
            alert('Error importing data. Please make sure the file is valid.')
          }
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className={cn("flex h-screen", theme === "dark" ? "dark bg-gray-900 text-white" : "bg-white")}>
      {/* Sidebar */}
      <div className="w-64 p-4 border-r flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Task Manager</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Users</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {users.map(user => (
                <DropdownMenuItem key={user.id} onClick={() => setCurrentUser(user.id)}>
                  <Avatar className="w-6 h-6 mr-2">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {user.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowAddUser(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {currentUser && (
          <>
            <h3 className="text-lg font-semibold mb-2">Folders</h3>
            <ul className="flex-grow overflow-auto">
              {folders.map((folder) => (
                <li
                  key={folder.id}
                  className={cn(
                    "cursor-pointer p-2 rounded mb-2",
                    selectedFolder === folder.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                  )}
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <div className="flex justify-between items-center">
                    <span>{folder.emoji} {folder.name}</span>
                    <div>
                      <Button variant="ghost" size="icon" className="rounded-full" onClick={(e) => {
                        e.stopPropagation()
                        setEditItem({ type: 'folder', id: folder.id })
                        setEditName(folder.name)
                        setEditEmoji(folder.emoji)
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-full" onClick={(e) => {
                        e.stopPropagation()
                        setItemToDelete({ type: 'folder', id: folder.id })
                        setShowDeleteConfirm(true)
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {selectedFolder === folder.id && (
                    <ul className="mt-2 space-y-1">
                      {folder.lists.map((list) => (
                        <li
                          key={list.id}
                          className={cn(
                            "cursor-pointer p-2 rounded",
                            selectedList === list.id ? "bg-secondary text-secondary-foreground" : "hover:bg-muted"
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedList(list.id)
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="flex items-center">
                              <span className="text-muted-foreground mr-2">|</span>
                              {list.name}
                            </span>
                            <div>
                              <Button variant="ghost" size="icon" className="rounded-full" onClick={(e) => {
                                e.stopPropagation()
                                setEditItem({ type: 'list', id: list.id })
                                setEditName(list.name)
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="rounded-full" onClick={(e) => {
                                e.stopPropagation()
                                setItemToDelete({ type: 'list', id: list.id })
                                setShowDeleteConfirm(true)
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
            {showAddFolder ? (
              <div className="mt-4 space-y-2">
                <Input
                  placeholder="New folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <Input
                  placeholder="Folder emoji"
                  value={newFolderEmoji}
                  onChange={(e) => setNewFolderEmoji(e.target.value)}
                />
                <div className="flex space-x-2">
                  <Button onClick={addFolder} className="flex-1">Add</Button>
                  <Button variant="outline" onClick={() => setShowAddFolder(false)} className="flex-1">Cancel</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full mt-4" onClick={() => setShowAddFolder(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Folder
              </Button>
            )}
            {selectedFolder && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full mt-2">
                    <Plus className="mr-2 h-4 w-4" /> Add List
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="listName">Name</Label>
                      <Input
                        id="listName"
                        placeholder="New list name"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                      />
                    </div>
                    <Button onClick={addList}>Add List</Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <div className="mt-4 flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => exportData(currentUser)}>
                    Export Current User
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportData()}>
                    Export All Users
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Label htmlFor="import-file" className="flex-1">
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" /> Import
                </Button>
                <Input
                  id="import-file"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={importData}
                />
              </Label>
            </div>
          </>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <Button onClick={toggleTheme}>{theme === "light" ? "Dark Mode" : "Light Mode"}</Button>
        </div>

        {currentUser && selectedFolder && selectedList && (
          <>
            {/* Add new task */}
            <div className="mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add Task
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="taskName">Name</Label>
                      <Input
                        id="taskName"
                        placeholder="New task name"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="taskDescription">Description</Label>
                      <Textarea
                        id="taskDescription"
                        placeholder="Task description"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Button onClick={addTask}>Add Task</Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Task list */}
            {folders
              .find(folder => folder.id === selectedFolder)
              ?.lists.find(list => list.id === selectedList)
              ?.tasks.length === 0 ? (
              <p className="text-center text-muted-foreground">No tasks yet. Add a task to get started!</p>
            ) : (
              Object.entries(groupTasksByDueDate(
                folders
                  .find(folder => folder.id === selectedFolder)
                  ?.lists.find(list => list.id === selectedList)
                  ?.tasks || []
              )).map(([group, tasks]) => (
                tasks.length > 0 && (
                  <div key={group} className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{group}</h3>
                    <ul>
                      {tasks.map((task) => (
                        <li
                          key={task.id}
                          className={cn(
                            "bg-card text-card-foreground p-4 rounded-lg shadow mb-2",
                            task.completed && "opacity-60"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "mr-2 rounded-full",
                                  task.completed ? "bg-green-500 text-white" : "bg-secondary"
                                )}
                                onClick={() => toggleTaskCompletion(task.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <div>
                                <h4 className={cn("font-semibold", task.completed && "line-through")}>{task.name}</h4>
                                <p className="text-sm text-muted-foreground">{task.description}</p>
                              </div>
                            </div>
                            <div>
                              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => {
                                setEditItem({ type: 'task', id: task.id })
                                setEditName(task.name)
                                setEditDescription(task.description)
                                setEditDate(task.dueDate)
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => {
                                setItemToDelete({ type: 'task', id: task.id })
                                setShowDeleteConfirm(true)
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {task.dueDate && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Due: {format(task.dueDate, "PPP")}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              ))
            )}
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {editItem?.type}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editName">Name</Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            {editItem?.type === 'folder' && (
              <div className="grid gap-2">
                <Label htmlFor="editEmoji">Emoji</Label>
                <Input
                  id="editEmoji"
                  value={editEmoji}
                  onChange={(e) => setEditEmoji(e.target.value)}
                />
              </div>
            )}
            {editItem?.type === 'task' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editDate ? format(editDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editDate}
                        onSelect={setEditDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newUserName">Name</Label>
              <Input
                id="newUserName"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Enter user name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newUserImage">Profile Image URL</Label>
              <Input
                id="newUserImage"
                value={newUserImage}
                onChange={(e) => setNewUserImage(e.target.value)}
                placeholder="Enter image URL (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
            <Button onClick={addUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}