"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import ClientList from "@/components/client-list"
import AddClientDialog from "@/components/add-client-dialog"
import type { Client } from "@/types/client"
import Image from "next/image"

export default function Home() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Charger les clients depuis l'API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/clients")
        if (!response.ok) throw new Error("Erreur lors du chargement des clients")
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error("Erreur:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [])

  const addClient = async (client: Omit<Client, "id">) => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(client),
      })

      if (!response.ok) throw new Error("Erreur lors de l'ajout du client")

      const newClient = await response.json()
      setClients([...clients, newClient])
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const updateClient = async (updatedClient: Client) => {
    try {
      const response = await fetch(`/api/clients/${updatedClient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedClient),
      })

      if (!response.ok) throw new Error("Erreur lors de la mise à jour du client")

      setClients(clients.map((client) => (client.id === updatedClient.id ? updatedClient : client)))
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const deleteClient = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Erreur lors de la suppression du client")

      setClients(clients.filter((client) => client.id !== id))
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const incrementLoyalty = async (id: string) => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
      })

      if (!response.ok) throw new Error("Erreur lors de l'ajout de points")

      const updatedClient = await response.json()
      setClients(clients.map((client) => (client.id === id ? updatedClient : client)))
    } catch (error) {
      console.error("Erreur:", error)
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery) ||
      (client.address && client.address.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="bg-pink-50 rounded-lg p-6 mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-pink-800 mb-2">Gestion de Cartes de Fidélité</h1>
          <p className="text-pink-700">Gérez facilement vos clientes et leurs cartes de fidélité</p>
        </div>
        <div className="h-16 w-16 relative">
          <Image
            src="/logo.png"
            alt="Logo de l'entreprise"
            fill
            style={{ objectFit: "contain" }}
            className="rounded-md"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une cliente..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <AddClientDialog onAddClient={addClient} />
      </div>

      {isLoading ? (
        <div className="text-center p-8 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">Chargement des clientes...</p>
        </div>
      ) : (
        <ClientList
          clients={filteredClients}
          onUpdateClient={updateClient}
          onDeleteClient={deleteClient}
          onIncrementLoyalty={incrementLoyalty}
        />
      )}
    </main>
  )
}
