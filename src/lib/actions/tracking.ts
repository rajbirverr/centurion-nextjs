'use server'

const DELHIVERY_BASE_URL = process.env.DELHIVERY_BASE_URL || 'https://track.delhivery.com'

export interface TrackingScan {
    ScanDateTime: string
    ScanType: string
    ScanDetail: string
    ScannedLocation: string
}

export interface TrackingData {
    awb: string
    current_status: string
    estimated_delivery_date: string
    scans: TrackingScan[]
    error?: string
}

export async function getTrackingStatus(awb: string): Promise<TrackingData | null> {
    const apiKey = process.env.DELHIVERY_API_TOKEN

    if (!apiKey || !awb) {
        return null
    }

    try {
        const url = `${DELHIVERY_BASE_URL}/api/v1/packages/json/?cl=${awb}&token=${apiKey}`
        console.log(`[Delhivery] Tracking AWB: ${awb}`)

        const response = await fetch(url, {
            next: { revalidate: 300 } // Cache for 5 minutes
        })

        if (!response.ok) {
            console.error(`[Delhivery] Tracking API Error: ${response.status}`)
            return null
        }

        const data = await response.json()

        // Response structure: { ShipmentData: [ { Shipment: { ... } } ] }
        if (data.ShipmentData && data.ShipmentData.length > 0) {
            const shipment = data.ShipmentData[0].Shipment
            return {
                awb: shipment.AWB,
                current_status: shipment.Status.Status,
                estimated_delivery_date: shipment.ExpectedDeliveryDate,
                scans: shipment.Scans.map((s: any) => ({
                    ScanDateTime: s.ScanDetail.ScanDateTime,
                    ScanType: s.ScanDetail.ScanType,
                    ScanDetail: s.ScanDetail.Instructions,
                    ScannedLocation: s.ScanDetail.ScannedLocation
                }))
            }
        }

        return null

    } catch (error) {
        console.error('Error fetching tracking:', error)
        return null
    }
}
