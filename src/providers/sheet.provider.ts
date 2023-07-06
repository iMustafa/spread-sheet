import { SheetUpdateStatus } from '@/types/api.types'

export class SheetsProvider {
  private static readonly BASE_URL = 'http://localhost:8082'

  private static async Request<TResponse>(url: string, options?: RequestInit) {
    const response = await fetch(url, options)
    const data = await response.json()
    return data as TResponse
  }

  public static getStatus(id: string) {
    const query = new URLSearchParams({ id })
    const url = `${this.BASE_URL}/get-status?${query.toString()}`
    return this.Request<SheetUpdateStatus>(url)
  }

  public static updateSheet(sheet: string) {
    return this.Request<SheetUpdateStatus>(`${this.BASE_URL}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sheet })
    })
  }
}
