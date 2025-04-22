"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit, Plus, Save, Trash, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function TagsPage() {
  // Mock data for tags
  const [tags, setTags] = useState([
    { id: "1", name: "Infrastructure", color: "blue", count: 8 },
    { id: "2", name: "Development", color: "green", count: 12 },
    { id: "3", name: "Maintenance", color: "yellow", count: 5 },
    { id: "4", name: "Critical", color: "red", count: 3 },
    { id: "5", name: "Low Priority", color: "gray", count: 7 },
  ])

  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("blue")

  const colors = [
    { name: "Red", value: "red" },
    { name: "Green", value: "green" },
    { name: "Blue", value: "blue" },
    { name: "Yellow", value: "yellow" },
    { name: "Purple", value: "purple" },
    { name: "Pink", value: "pink" },
    { name: "Gray", value: "gray" },
  ]

  const handleAddTag = () => {
    if (newTagName.trim() === "") return

    const newTag = {
      id: `${tags.length + 1}`,
      name: newTagName,
      color: newTagColor,
      count: 0,
    }

    setTags([...tags, newTag])
    setNewTagName("")
    setNewTagColor("blue")
  }

  const handleUpdateTag = (id: string, name: string, color: string) => {
    setTags(tags.map((tag) => (tag.id === id ? { ...tag, name, color } : tag)))
    setEditingTag(null)
  }

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id))
  }

  const getTagColorClass = (color: string) => {
    switch (color) {
      case "red":
        return "bg-red-100 text-red-800 border-red-200"
      case "green":
        return "bg-green-100 text-green-800 border-green-200"
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "purple":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "pink":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "gray":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tags Management</h1>
        <p className="text-muted-foreground">Create and manage tags for your projects</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Tag</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name"
              />
            </div>
            <div className="w-full md:w-48">
              <Label htmlFor="tag-color">Color</Label>
              <Select value={newTagColor} onValueChange={setNewTagColor}>
                <SelectTrigger id="tag-color">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-2 bg-${color.value}-500`} />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddTag}>
                <Plus className="mr-2 h-4 w-4" />
                Add Tag
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-3 border rounded-lg">
                {editingTag === tag.id ? (
                  <div className="flex flex-1 items-center gap-4">
                    <Input
                      value={tag.name}
                      onChange={(e) => {
                        setTags(tags.map((t) => (t.id === tag.id ? { ...t, name: e.target.value } : t)))
                      }}
                      className="max-w-xs"
                    />
                    <Select
                      value={tag.color}
                      onValueChange={(value) => {
                        setTags(tags.map((t) => (t.id === tag.id ? { ...t, color: value } : t)))
                      }}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full mr-2 bg-${color.value}-500`} />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdateTag(tag.id, tag.name, tag.color)}>
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingTag(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className={getTagColorClass(tag.color)}>
                        {tag.name}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Used in {tag.count} {tag.count === 1 ? "activity" : "activities"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditingTag(tag.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Tag</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete the tag "{tag.name}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button variant="destructive" onClick={() => handleDeleteTag(tag.id)}>
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
