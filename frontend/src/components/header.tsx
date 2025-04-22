"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Plus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import CreateProjectForm from "@/components/create-project-form"
import CreateActivityForm from "@/components/create-activity-form"

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()

  // Determine if we're in a project context
  const isProjectContext = pathname.startsWith("/projects/") || pathname === "/kanban" || pathname === "/gantt"

  return (
    <header className="border-b bg-background p-4 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold hidden md:block">
          {pathname === "/" && "Dashboard"}
          {pathname === "/projects" && "Projects"}
          {pathname === "/kanban" && "Kanban Board"}
          {pathname === "/gantt" && "Gantt Chart"}
          {pathname === "/tags" && "Tags Management"}
          {pathname === "/settings" && "Settings"}
          {pathname.startsWith("/projects/") && "Project Details"}
        </h1>
      </div>

      <div className="flex items-center space-x-2">
        {isSearchOpen ? (
          <div className="relative w-64">
            <Input
              type="text"
              placeholder="Search..."
              className="pr-8"
              autoFocus
              onBlur={() => setIsSearchOpen(false)}
            />
            <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>
        )}

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        {isProjectContext && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Activity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CreateActivityForm />
            </DialogContent>
          </Dialog>
        )}

        {pathname === "/projects" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <CreateProjectForm />
            </DialogContent>
          </Dialog>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-user.jpg" alt="User" />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
