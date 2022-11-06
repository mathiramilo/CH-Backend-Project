import admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'
import dbConfig from '../../db/db.config'
import { HTTP_STATUS } from '../../constants/api.constants'
import { HttpError } from '../../utils/api.utils'

admin.initializeApp({
  credential: admin.credential.cert(dbConfig.firebase.credentials)
})

class FirebaseContainer {
  collection

  constructor(collection) {
    const db = getFirestore()
    this.collection = db.collection(collection)
  }

  static async connect() {}

  static async disconnect() {
    await admin.app().delete()
  }

  async getAll() {
    const docRef = await this.collection.get()
    const documents = docRef.docs
    return documents.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      }
    })
  }

  async getById(id) {
    const docRef = await this.collection.doc(id)
    if (!docRef) {
      const message = `Resource with id ${id} does not exists`
      throw new HttpError(HTTP_STATUS.NOT_FOUND, message)
    }
    const document = await docRef.get()
    return document.data()
  }

  async save(item) {
    const docRef = this.collection.doc()
    return await docRef.set(item)
  }

  async update(id, item) {
    const docRef = this.collection.doc(id)
    if (!docRef) {
      const message = `Resource with id ${id} does not exists`
      throw new HttpError(HTTP_STATUS.NOT_FOUND, message)
    }
    return await docRef.update(item)
  }

  async delete(id) {
    const docRef = this.collection.doc(id)
    return await docRef.delete()
  }
}

export default FirebaseContainer
