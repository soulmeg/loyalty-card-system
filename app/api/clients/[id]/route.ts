import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET un client spécifique
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const mongoClient = await clientPromise
    const db = mongoClient.db("loyalty-app")

    const client = await db.collection("clients").findOne({ _id: new ObjectId(id) })

    if (!client) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 })
    }

    return NextResponse.json({
      id: client._id.toString(),
      name: client.name,
      phone: client.phone,
      address: client.address || "",
      loyaltyPoints: client.loyaltyPoints,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du client:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT pour mettre à jour un client
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { name, phone, address, loyaltyPoints } = body

    if (!name || !phone) {
      return NextResponse.json({ error: "Nom et téléphone requis" }, { status: 400 })
    }

    const mongoClient = await clientPromise
    const db = mongoClient.db("loyalty-app")

    const result = await db
      .collection("clients")
      .updateOne({ _id: new ObjectId(id) }, { $set: { name, phone, address, loyaltyPoints } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 })
    }

    return NextResponse.json({
      id,
      name,
      phone,
      address: address || "",
      loyaltyPoints,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du client:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE pour supprimer un client
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const mongoClient = await clientPromise
    const db = mongoClient.db("loyalty-app")

    const result = await db.collection("clients").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur lors de la suppression du client:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PATCH pour incrémenter les points de fidélité
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const mongoClient = await clientPromise
    const db = mongoClient.db("loyalty-app")

    const result = await db.collection("clients").updateOne({ _id: new ObjectId(id) }, { $inc: { loyaltyPoints: 1 } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 })
    }

    // Récupérer le client mis à jour
    const updatedClient = await db.collection("clients").findOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      id,
      name: updatedClient?.name,
      phone: updatedClient?.phone,
      address: updatedClient?.address || "",
      loyaltyPoints: updatedClient?.loyaltyPoints,
    })
  } catch (error) {
    console.error("Erreur lors de l'incrémentation des points:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
