import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

// GET tous les clients
export async function GET() {
  try {
    const mongoClient = await clientPromise
    const db = mongoClient.db("loyalty-app")
    const clients = await db.collection("clients").find({}).toArray()

    // Convertir _id en id pour la compatibilité avec notre interface Client
    const formattedClients = clients.map((client) => ({
      id: client._id.toString(),
      name: client.name,
      phone: client.phone,
      address: client.address || "",
      loyaltyPoints: client.loyaltyPoints,
    }))

    return NextResponse.json(formattedClients)
  } catch (error) {
    console.error("Erreur lors de la récupération des clients:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST pour créer un nouveau client
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, address, loyaltyPoints } = body

    if (!name || !phone) {
      return NextResponse.json({ error: "Nom et téléphone requis" }, { status: 400 })
    }

    const mongoClient = await clientPromise
    const db = mongoClient.db("loyalty-app")

    const result = await db.collection("clients").insertOne({
      name,
      phone,
      address: address || "",
      loyaltyPoints: loyaltyPoints || 0,
    })

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        name,
        phone,
        address: address || "",
        loyaltyPoints: loyaltyPoints || 0,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Erreur lors de la création du client:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
