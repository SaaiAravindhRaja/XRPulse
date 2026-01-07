
import { Client } from 'xrpl'

const XRPL_RPC_URL = process.env.NEXT_PUBLIC_XRPL_RPC_URL || 'wss://s.altnet.rippletest.net:51233'

class XrplService {
    private static instance: XrplService
    public client: Client
    private isConnected: boolean = false

    private constructor() {
        this.client = new Client(XRPL_RPC_URL)

        this.client.on('error', (errorCode, errorMessage) => {
            console.error(`[XRPL Error] ${errorCode}: ${errorMessage}`)
        })

        this.client.on('connected', () => {
            console.log('[XRPL] Connected to Testnet')
            this.isConnected = true
        })

        this.client.on('disconnected', () => {
            console.log('[XRPL] Disconnected')
            this.isConnected = false
        })
    }

    public static getInstance(): XrplService {
        if (!XrplService.instance) {
            XrplService.instance = new XrplService()
        }
        return XrplService.instance
    }

    public async connect(): Promise<void> {
        if (this.isConnected) return
        if (this.client.isConnected()) {
            this.isConnected = true
            return
        }

        try {
            await this.client.connect()
        } catch (error) {
            console.error('[XRPL] Connection Failed:', error)
            throw error
        }
    }

    public async disconnect(): Promise<void> {
        if (!this.isConnected) return
        await this.client.disconnect()
    }
}

export const xrplClient = XrplService.getInstance()
