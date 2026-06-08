"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  birthDetailsSchema,
  type BirthDetailsFormValues,
} from "@/lib/validations"

interface BirthFormProps {
  onSubmit: (values: BirthDetailsFormValues) => void
  isLoading?: boolean
  defaultValues?: Partial<BirthDetailsFormValues>
}

export function BirthForm({
  onSubmit,
  isLoading = false,
  defaultValues,
}: BirthFormProps) {
  const form = useForm<BirthDetailsFormValues>({
    resolver: zodResolver(birthDetailsSchema),
    defaultValues: {
      name: "",
      birthDate: "",
      birthTime: "",
      birthPlace: "",
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        noValidate
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your name"
                  autoComplete="name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="birthTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Time</FormLabel>
                <FormControl>
                  <Input type="time" step={60} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="birthPlace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Birth Place</FormLabel>
              <FormControl>
                <Input
                  placeholder="City, State/Region, Country"
                  autoComplete="address-level2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="lg" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Generating Chart...
            </>
          ) : (
            "Generate Birth Chart"
          )}
        </Button>
      </form>
    </Form>
  )
}
