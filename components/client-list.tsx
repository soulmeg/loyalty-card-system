"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MoreVertical, Edit, Trash2, Plus, Award } from "lucide-react"
import type { Client } from "@/types/client"
import EditClientForm from "./edit-client-form"

interface ClientListProps {
  clients: Client[]
  onUpdateClient: (client: Client) => void
  onDeleteClient: (id: string) => void
  onIncrementLoyalty: (id: string) => void
}

export default function ClientList({ clients, onUpdateClient, onDeleteClient, onIncrementLoyalty }: ClientListProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [loyaltyDialogOpen, setLoyaltyDialogOpen] = useState(false)

  const handleEditClick = (client: Client) => {
    setSelectedClient(client)
    setEditDialogOpen(true)
  }

  const handleLoyaltyClick = (client: Client) => {
    setSelectedClient(client)
    setLoyaltyDialogOpen(true)
  }

  const handleSaveEdit = (updatedClient: Client) => {
    onUpdateClient(updatedClient)
    setEditDialogOpen(false)
  }

  const handleAddPoint = () => {
    if (selectedClient) {
      onIncrementLoyalty(selectedClient.id)
      setLoyaltyDialogOpen(false)
    }
  }

  // Function to determine if a reward is available
  const isRewardAvailable = (points: number) => points >= 10

  return (
    <div>
      {clients.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">Aucune cliente trouvée. Ajoutez votre première cliente!</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Points Fidélité</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>{client.address || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={isRewardAvailable(client.loyaltyPoints) ? "text-pink-600 font-bold" : ""}>
                        {client.loyaltyPoints}
                      </span>
                      {isRewardAvailable(client.loyaltyPoints) && <Award className="h-4 w-4 text-pink-600" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleLoyaltyClick(client)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter un point
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(client)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteClient(client.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Client Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la cliente</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <EditClientForm client={selectedClient} onSave={handleSaveEdit} onCancel={() => setEditDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Loyalty Card Dialog */}
      <Dialog open={loyaltyDialogOpen} onOpenChange={setLoyaltyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carte de Fidélité</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="py-4">
              <Card className="bg-gradient-to-r from-pink-100 to-purple-100 border-pink-300">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-2">{selectedClient.name}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{selectedClient.phone}</p>
                  {selectedClient.address && (
                    <p className="text-sm text-muted-foreground mb-4">{selectedClient.address}</p>
                  )}

                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">Points de fidélité:</div>
                    <div className="grid grid-cols-5 gap-2">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`aspect-square rounded-full flex items-center justify-center ${
                            i < selectedClient.loyaltyPoints % 10
                              ? "bg-pink-500 text-white"
                              : "bg-pink-100 text-pink-300"
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Total des points: {selectedClient.loyaltyPoints}</p>
                      <p className="text-sm text-muted-foreground">
                        {Math.floor(selectedClient.loyaltyPoints / 10)} récompense(s) utilisée(s)
                      </p>
                    </div>
                    {isRewardAvailable(selectedClient.loyaltyPoints) && (
                      <div className="bg-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Récompense disponible!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setLoyaltyDialogOpen(false)}>
                  Fermer
                </Button>
                <Button onClick={handleAddPoint}>Ajouter un point</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
