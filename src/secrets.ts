import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

const client = new SecretsManagerClient({})
let adminKey: string | undefined

export async function getAdminKey(): Promise<string> {
  if (!adminKey) {
    const response = await client.send(new GetSecretValueCommand({ SecretId: 'admin-key' }))
    adminKey = response.SecretString!
  }
  return adminKey
}

export function resetAdminKey(): void {
  adminKey = undefined
}
