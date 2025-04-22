"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Project name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  manager: z.string().optional(),
})

export default function CreateProjectForm() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      manager: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log({ ...values, tags: selectedTags })
    // Here you would save the project to your backend
  }

  const availableTags = [
    { id: "1", name: "Infrastructure", color: "blue" },
    { id: "2", name: "Development", color: "green" },
    { id: "3", name: "Maintenance", color: "yellow" },
    { id: "4", name: "Critical", color: "red" },
    { id: "5", name: "Low Priority", color: "gray" },
  ]

  const addTag = (tagId: string) => {
    if (!selectedTags.includes(tagId)) {
      setSelectedTags([...selectedTags, tagId])
    }
  }

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((id) => id !== tagId))
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-2xl font-bold">Create New Project</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter project name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the project" className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="manager"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Manager</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project manager" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="user1">John Doe</SelectItem>
                    <SelectItem value="user2">Jane Smith</SelectItem>
                    <SelectItem value="user3">Robert Johnson</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Tags</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedTags.map((tagId) => {
                const tag = availableTags.find((t) => t.id === tagId)
                if (!tag) return null
                return (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className={`bg-${tag.color}-100 text-${tag.color}-800 border-${tag.color}-200`}
                  >
                    {tag.name}
                    <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={() => removeTag(tag.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              })}
            </div>
            <Select onValueChange={(value) => addTag(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Add tag" />
              </SelectTrigger>
              <SelectContent>
                {availableTags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id} disabled={selectedTags.includes(tag.id)}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
