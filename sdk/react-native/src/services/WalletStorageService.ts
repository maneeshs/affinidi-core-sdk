import { __dangerous } from '@affinidi/wallet-core-sdk'

import KeysService from './KeysService'

export default class WalletStorageService extends __dangerous.WalletStorageService {
  _keysService: KeysService
  _credentialsIdsAndIndexesMap: any

  constructor(encryptedSeed: string, password: string, options: any = {}) {
    super(encryptedSeed, password, options)

    this._keysService = new KeysService(encryptedSeed, password)
    this._credentialsIdsAndIndexesMap = {}
  }

  async createEncryptedMessageByMyKey(object: any): Promise<string> {
    const { seed, didMethod } = this._keysService.decryptSeed()
    const seedHex = seed.toString('hex')
    const publicKeyHex = KeysService.getPublicKey(seedHex, didMethod)

    return this._keysService.encryptByPublicKey(publicKeyHex, object)
  }

  async encryptCredentials(data: any): Promise<string[]> {
    const encryptedCredentials = []

    /* istanbul ignore else: code simplicity */
    if (data.length && data.length > 0) {
      for (const item of data) {
        const cyphertext = await this.createEncryptedMessageByMyKey(item)

        encryptedCredentials.push(cyphertext)
      }
    }

    return encryptedCredentials
  }

  async decryptCredentials(blobs: any): Promise<any> {
    const decryptedCredentials = []

    /* istanbul ignore else: code simplicity */
    if (blobs && blobs.length) {
      for (const blob of blobs) {
        const credential = await this._keysService.decryptByPrivateKey(blob.cyphertext)
        this._credentialsIdsAndIndexesMap[credential.id] = blob.id

        decryptedCredentials.push(credential)
      }
    }

    return decryptedCredentials
  }

  findCredentialIndexById(id: string) {
    const credentialIndexToDelete = this._credentialsIdsAndIndexesMap[id]

    if (!credentialIndexToDelete && credentialIndexToDelete !== 0) {
      throw new __dangerous.SdkError('COR-23', { id })
    }

    return credentialIndexToDelete
  }
}
