"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/components/i18n/i18n-provider"
import { adminApi, ApiException as AdminApiException } from "@/lib/api/admin"
import { userApi, ApiException as UserApiException } from "@/lib/api/user"
import type { AdminUser, AdminUserCreateDTO, AdminUserUpdateDTO } from "@/lib/types/admin"

const roleOptions = ["student", "teacher", "parent", "admin"]

const emptyUpdateForm: AdminUserUpdateDTO = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  location: "",
  gradeLevel: "",
  school: "",
  biography: "",
}

const pageSizeOptions = [10, 20, 50]

type SortKey = "id" | "name" | "email" | "role"
type SortDirection = "asc" | "desc"

export function AdminPanelContent() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useI18n()

  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<AdminUser[]>([])

  const [roleFilter, setRoleFilter] = useState("all")
  const [userIdQuery, setUserIdQuery] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(pageSizeOptions[0])
  const [sortKey, setSortKey] = useState<SortKey>("id")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null)

  const [newUser, setNewUser] = useState<AdminUserCreateDTO>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "student",
  })

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [updateForm, setUpdateForm] = useState<AdminUserUpdateDTO>(emptyUpdateForm)

  const resolvedUsers = useMemo(() => users, [users])

  const filteredUsers = useMemo(() => {
    const term = searchQuery.trim().toLowerCase()
    if (!term) return resolvedUsers

    return resolvedUsers.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
      const email = (user.email || "").toLowerCase()
      return fullName.includes(term) || email.includes(term)
    })
  }, [resolvedUsers, searchQuery])

  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers]

    const compareValues = (a: AdminUser, b: AdminUser) => {
      const resolvedIdA = a.id ?? a.userId ?? 0
      const resolvedIdB = b.id ?? b.userId ?? 0

      switch (sortKey) {
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case "email":
          return (a.email || "").localeCompare(b.email || "")
        case "role":
          return (a.role || "").localeCompare(b.role || "")
        default:
          return resolvedIdA - resolvedIdB
      }
    }

    sorted.sort((a, b) => {
      const result = compareValues(a, b)
      return sortDirection === "asc" ? result : -result
    })

    return sorted
  }, [filteredUsers, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize))

  const pagedUsers = useMemo(() => {
    const startIndex = (pageNumber - 1) * pageSize
    return sortedUsers.slice(startIndex, startIndex + pageSize)
  }, [pageNumber, pageSize, sortedUsers])

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const profile = await userApi.getProfile()

        if (profile.role.toLowerCase() !== "admin") {
          toast({
            title: String(t("toasts.accessDenied")),
            description: String(t("toasts.adminOnly")),
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        if (error instanceof UserApiException && error.status === 401) {
          toast({
            title: String(t("toasts.authRequired")),
            description: String(t("toasts.loginToAdmin")),
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        toast({
          title: String(t("toasts.accessDenied")),
          description: String(t("toasts.adminOnly")),
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    }

    verifyAdminAccess()
  }, [router, t, toast])

  useEffect(() => {
    if (!isAuthorized) return
    void loadAllUsers()
  }, [isAuthorized])

  useEffect(() => {
    if (!isAuthorized) return

    const timeout = setTimeout(() => {
      const trimmedId = userIdQuery.trim()

      if (trimmedId) {
        const parsedId = Number(trimmedId)
        if (Number.isFinite(parsedId) && parsedId > 0) {
          void handleFetchById()
        }
        return
      }

      if (roleFilter !== "all") {
        void handleFetchByRole()
        return
      }

      void loadAllUsers()
    }, 400)

    return () => clearTimeout(timeout)
  }, [isAuthorized, roleFilter, userIdQuery])

  useEffect(() => {
    setPageNumber(1)
  }, [searchQuery])

  useEffect(() => {
    if (pageNumber > totalPages) {
      setPageNumber(totalPages)
    }
  }, [pageNumber, totalPages])

  const loadAllUsers = async () => {
    setIsLoading(true)
    try {
      const response = await adminApi.getUsers()
      setUsers(response)
    } catch (error) {
      if (error instanceof AdminApiException && error.status === 401) {
        toast({
          title: String(t("toasts.authRequired")),
          description: String(t("toasts.loginToAdmin")),
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      toast({
        title: String(t("toasts.couldNotLoadUsers")),
        description: error instanceof Error ? error.message : String(t("toasts.failedLoadUsers")),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFetchById = async () => {
    const parsedId = Number(userIdQuery)
    if (!Number.isFinite(parsedId) || parsedId <= 0) {
      toast({
        title: String(t("toasts.missingFields")),
        description: String(t("admin.invalidUserId")),
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const user = await adminApi.getUserById(parsedId)
      setUsers([user])
    } catch (error) {
      toast({
        title: String(t("toasts.couldNotLoadUsers")),
        description: error instanceof Error ? error.message : String(t("toasts.failedLoadUsers")),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFetchByRole = async () => {
    if (roleFilter === "all") {
      void loadAllUsers()
      return
    }

    setIsLoading(true)
    try {
      const response = await adminApi.getUsersByRole(roleFilter)
      setUsers(response)
    } catch (error) {
      toast({
        title: String(t("toasts.couldNotLoadUsers")),
        description: error instanceof Error ? error.message : String(t("toasts.failedLoadUsers")),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password) {
      toast({
        title: String(t("toasts.missingFields")),
        description: String(t("admin.requiredFields")),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await adminApi.createUser(newUser)
      toast({
        title: String(t("toasts.success")),
        description: String(t("admin.userCreated")),
      })
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "student",
      })
      await loadAllUsers()
    } catch (error) {
      toast({
        title: String(t("toasts.couldNotCreateUser")),
        description: error instanceof Error ? error.message : String(t("toasts.failedCreateUser")),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectForEdit = (user: AdminUser) => {
    const resolvedId = user.id ?? user.userId
    if (!resolvedId) return

    setSelectedUserId(resolvedId)
    setUpdateForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      phoneNumber: user.phone || "",
      location: user.location || "",
      gradeLevel: user.gradeLevel || "",
      school: user.school || "",
      biography: user.bio || "",
    })
  }

  const handleUpdateUser = async () => {
    if (!selectedUserId) return

    setIsSubmitting(true)
    try {
      await adminApi.updateUser(selectedUserId, updateForm)
      toast({
        title: String(t("toasts.success")),
        description: String(t("admin.userUpdated")),
      })
      setSelectedUserId(null)
      setUpdateForm(emptyUpdateForm)
      await loadAllUsers()
    } catch (error) {
      toast({
        title: String(t("toasts.couldNotUpdateUser")),
        description: error instanceof Error ? error.message : String(t("toasts.failedUpdateUser")),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    setIsSubmitting(true)
    try {
      await adminApi.deleteUser(userId)
      toast({
        title: String(t("toasts.success")),
        description: String(t("admin.userDeleted")),
      })
      await loadAllUsers()
    } catch (error) {
      toast({
        title: String(t("toasts.couldNotDeleteUser")),
        description: error instanceof Error ? error.message : String(t("toasts.failedDeleteUser")),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSort = (key: SortKey) => {
    setSortKey((current) => {
      if (current === key) {
        setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"))
        return current
      }

      setSortDirection("asc")
      return key
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container max-w-6xl py-8 px-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{String(t("admin.title"))}</h1>
          <p className="text-sm text-muted-foreground">{String(t("admin.subtitle"))}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{String(t("admin.filtersTitle"))}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="space-y-2">
                <Label htmlFor="user-id">{String(t("admin.userId"))}</Label>
                <Input
                  id="user-id"
                  value={userIdQuery}
                  onChange={(event) => setUserIdQuery(event.target.value)}
                  placeholder={String(t("admin.userIdPlaceholder"))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-search">{String(t("admin.search"))}</Label>
                <Input
                  id="user-search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={String(t("admin.searchPlaceholder"))}
                />
              </div>

              <div className="space-y-2">
                <Label>{String(t("admin.role"))}</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{String(t("admin.allRoles"))}</SelectItem>
                    {roleOptions.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{String(t("admin.sortBy"))}</Label>
                <Select value={sortKey} onValueChange={(value) => setSortKey(value as SortKey)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">{String(t("admin.userId"))}</SelectItem>
                    <SelectItem value="name">{String(t("admin.name"))}</SelectItem>
                    <SelectItem value="email">{String(t("auth.email"))}</SelectItem>
                    <SelectItem value="role">{String(t("admin.role"))}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{String(t("admin.sortDirection"))}</Label>
                <Button
                  variant="outline"
                  onClick={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
                  disabled={isLoading}
                  className="w-full justify-between"
                >
                  {String(sortDirection === "asc" ? t("admin.sortAsc") : t("admin.sortDesc"))}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{String(t("admin.usersTitle"))}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">{String(t("common.loading"))}</p>
            ) : sortedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{String(t("admin.noUsers"))}</p>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-left"
                          onClick={() => handleSort("id")}
                        >
                          {String(t("admin.userId"))}
                          {sortKey === "id" ? (
                            <span className="text-xs text-muted-foreground">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          ) : null}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-left"
                          onClick={() => handleSort("name")}
                        >
                          {String(t("admin.name"))}
                          {sortKey === "name" ? (
                            <span className="text-xs text-muted-foreground">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          ) : null}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-left"
                          onClick={() => handleSort("email")}
                        >
                          {String(t("auth.email"))}
                          {sortKey === "email" ? (
                            <span className="text-xs text-muted-foreground">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          ) : null}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-left"
                          onClick={() => handleSort("role")}
                        >
                          {String(t("admin.role"))}
                          {sortKey === "role" ? (
                            <span className="text-xs text-muted-foreground">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          ) : null}
                        </button>
                      </TableHead>
                      <TableHead>{String(t("admin.actions"))}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedUsers.map((user) => {
                      const resolvedId = user.id ?? user.userId
                      return (
                        <TableRow key={`${resolvedId}-${user.email}`}>
                          <TableCell>{resolvedId ?? "-"}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {user.firstName} {user.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">{user.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{user.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {resolvedId ? (
                                <>
                                  <Button variant="outline" onClick={() => handleSelectForEdit(user)}>
                                    {String(t("admin.edit"))}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => setPendingDeleteId(resolvedId)}
                                    disabled={isSubmitting}
                                  >
                                    {String(t("admin.delete"))}
                                  </Button>
                                </>
                              ) : null}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{String(t("admin.page"))} {pageNumber}</span>
                    <span>{String(t("admin.of"))} {totalPages}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{String(t("admin.pageSize"))}</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(value) => {
                        setPageSize(Number(value))
                        setPageNumber(1)
                      }}
                    >
                      <SelectTrigger className="w-[90px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {pageSizeOptions.map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => setPageNumber((previous) => Math.max(1, previous - 1))}
                      disabled={pageNumber <= 1}
                    >
                      {String(t("admin.previous"))}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setPageNumber((previous) => Math.min(totalPages, previous + 1))}
                      disabled={pageNumber >= totalPages}
                    >
                      {String(t("admin.next"))}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{String(t("admin.addUserTitle"))}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="new-first">{String(t("auth.firstName"))}</Label>
                  <Input
                    id="new-first"
                    value={newUser.firstName}
                    onChange={(event) => setNewUser({ ...newUser, firstName: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-last">{String(t("auth.lastName"))}</Label>
                  <Input
                    id="new-last"
                    value={newUser.lastName}
                    onChange={(event) => setNewUser({ ...newUser, lastName: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">{String(t("auth.email"))}</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newUser.email}
                    onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-pass">{String(t("auth.password"))}</Label>
                  <Input
                    id="new-pass"
                    type="password"
                    value={newUser.password}
                    onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{String(t("auth.role"))}</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreateUser} disabled={isSubmitting}>
                {String(t("admin.addUserButton"))}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{String(t("admin.updateUserTitle"))}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                {selectedUserId
                  ? `${String(t("admin.selectedUser"))}: ${selectedUserId}`
                  : String(t("admin.noUserSelected"))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="upd-first">{String(t("auth.firstName"))}</Label>
                  <Input
                    id="upd-first"
                    value={updateForm.firstName}
                    onChange={(event) => setUpdateForm({ ...updateForm, firstName: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upd-last">{String(t("auth.lastName"))}</Label>
                  <Input
                    id="upd-last"
                    value={updateForm.lastName}
                    onChange={(event) => setUpdateForm({ ...updateForm, lastName: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upd-email">{String(t("auth.email"))}</Label>
                  <Input
                    id="upd-email"
                    type="email"
                    value={updateForm.email}
                    onChange={(event) => setUpdateForm({ ...updateForm, email: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upd-phone">{String(t("auth.phone"))}</Label>
                  <Input
                    id="upd-phone"
                    value={updateForm.phoneNumber}
                    onChange={(event) => setUpdateForm({ ...updateForm, phoneNumber: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upd-location">{String(t("auth.location"))}</Label>
                  <Input
                    id="upd-location"
                    value={updateForm.location}
                    onChange={(event) => setUpdateForm({ ...updateForm, location: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{String(t("auth.gradeLevel"))}</Label>
                  <Input
                    value={updateForm.gradeLevel}
                    onChange={(event) => setUpdateForm({ ...updateForm, gradeLevel: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upd-school">{String(t("auth.school"))}</Label>
                  <Input
                    id="upd-school"
                    value={updateForm.school}
                    onChange={(event) => setUpdateForm({ ...updateForm, school: event.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="upd-bio">{String(t("profile.bio"))}</Label>
                  <Input
                    id="upd-bio"
                    value={updateForm.biography}
                    onChange={(event) => setUpdateForm({ ...updateForm, biography: event.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleUpdateUser} disabled={isSubmitting || !selectedUserId}>
                  {String(t("admin.updateUserButton"))}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedUserId(null)
                    setUpdateForm(emptyUpdateForm)
                  }}
                  disabled={isSubmitting}
                >
                  {String(t("admin.clearSelection"))}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <AlertDialog open={pendingDeleteId !== null} onOpenChange={() => setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{String(t("admin.deleteTitle"))}</AlertDialogTitle>
            <AlertDialogDescription>{String(t("admin.deleteDescription"))}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{String(t("admin.cancelDelete"))}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDeleteId) {
                  void handleDeleteUser(pendingDeleteId)
                }
                setPendingDeleteId(null)
              }}
            >
              {String(t("admin.confirmDelete"))}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
