'use server'

interface ShippingRate {
    serviceable: boolean
    cost: number
    method: 'standard' | 'express'
    estimated_delivery?: string
    error?: string
}

const DELHIVERY_BASE_URL = process.env.DELHIVERY_BASE_URL || 'https://track.delhivery.com'

export async function calculateShipping(destinationPincode: string): Promise<ShippingRate[]> {
    const apiKey = process.env.DELHIVERY_API_TOKEN
    // TODO: User to configure this. Defaulting to a common metro pincode (New Delhi) for fallback
    const pickupPincode = process.env.DELHIVERY_PICKUP_PINCODE || '110001'

    if (!apiKey) {
        console.warn('DELHIVERY_API_TOKEN not found. Returning default static rates.')
        // Fallback to static rates if API is not configured
        return [
            { serviceable: true, cost: 100, method: 'standard', estimated_delivery: '4-7 business days' },
            { serviceable: true, cost: 250, method: 'express', estimated_delivery: '1-3 business days' }
        ]
    }

    try {
        // Using the Serviceability API which gives both status and estimated cost/TAT
        // Endpoint: /api/kcl/serviceability/
        // specific URL construction might vary, using the standard query param approach

        // Construct URL with query parameters
        // Using the Serviceability API which gives both status and estimated cost/TAT
        // Endpoint: /c/api/pin-codes/json/

        const url = new URL(`${DELHIVERY_BASE_URL}/c/api/pin-codes/json/`)
        url.searchParams.append('filter_codes', destinationPincode)

        // Note: 'source' param is not needed for this endpoint unless filtering by pickup
        // url.searchParams.append('source', pickupPincode)

        console.log(`[Delhivery] Checking serviceability for Pincode: ${destinationPincode}`)
        // console.log(`[Delhivery] URL: ${url.toString()}`)

        const response = await fetch(url.toString(), {
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            },
            next: { revalidate: 0 } // Cache disabled for debugging
        })

        if (!response.ok) {
            console.error(`[Delhivery] API Error: ${response.status} ${response.statusText}`)
            throw new Error(`Delhivery API Error: ${response.statusText}`)
        }

        const data = await response.json()

        // Parse response - The structure depends on the specific API version.
        // Common structure for /c/api/pin-codes/json/:
        // { "delivery_codes": [{ "postal_code": "110001", "pre_paid": "Y", "cod": "Y", ... }] }

        // For /api/kcl/serviceability/, it might contain 'rate' info if configured.
        // If we don't get exact rates, we will default to static rules based on serviceability.

        const deliveryCodes = data.delivery_codes || []

        // API returns postal_code as an object: { postal_code: { pin: 530011, ... } }
        // We find the entry where pin matches, then return that inner postal_code object which contains the flags
        const found = deliveryCodes.find((p: any) => p.postal_code && String(p.postal_code.pin) === String(destinationPincode))
        const pincodeData = found ? found.postal_code : null

        if (!pincodeData) {
            // Pincode not found in response
            return []
        }

        // Check if serviceable
        const isServiceable = pincodeData.pre_paid === 'Y' || pincodeData.cod === 'Y'

        if (!isServiceable) {
            console.warn(`[Delhivery] Pincode ${destinationPincode} is not serviceable.`)
            return []
        }

        // --- Custom Rate Logic (Since API only returns Serviceability) ---
        // User Request: "Charge customer 3x the Delivery Base Price"

        // Base Rates Table (Estimates since API doesn't provide them)
        // Zone A (Local City): ₹40
        // Zone B (Same State): ₹50
        // Zone C (Metros): ₹70
        // Zone D (Rest of India): ₹90

        let baseRate = 90; // Default to Zone D (Most expensive)

        // Detect Zone based on State/City from API response
        // pincodeData has: district, state_code: "AP", city: "Visakhapatnam"
        // Our Warehouse (Pickup) is likely in AP (Visakhapatnam - 530011/110001)
        // Let's assume Warehouse State Code is 'AP' (Andhra Pradesh) or 'DL' (Delhi) based on user's pickup pin.
        // TODO: Ideally we infer pickup state from the pickup pincode or config. 
        // For now, assuming Pickup is from the same region as the 'source' param or default.

        const destinationState = pincodeData.state_code; // e.g., 'AP'
        const pickupState = 'AP'; // Assuming Andhra Pradesh based on user's location hint (shipping from 53xx or similar)
        // Update this if user confirms different warehouse state!

        if (pincodeData.city && pincodeData.city.toLowerCase().includes('visakhapatnam')) {
            baseRate = 40; // Zone A: Same City
        } else if (destinationState === pickupState) {
            baseRate = 50; // Zone B: Same State
        } else if (['DL', 'MH', 'KA', 'TN', 'WB'].includes(destinationState)) {
            baseRate = 70; // Zone C: Major Metro States (Delhi, Maharashtra, Karnataka, TN, Bengal)
        } else {
            baseRate = 90; // Zone D: Rest of India
        }

        const multiplier = 3;
        const finalStandardCost = baseRate * multiplier;
        const finalExpressCost = (baseRate + 50) * multiplier; // Express adds margin

        console.log(`[Delhivery] Serviceable: YESapi. Zone Base: ₹${baseRate}. Multiplier: ${multiplier}x. Final: ₹${finalStandardCost}`);

        return [
            {
                serviceable: true,
                cost: finalStandardCost,
                method: 'standard',
                estimated_delivery: '4-7 Days'
            },
            {
                serviceable: true,
                cost: finalExpressCost,
                method: 'express',
                estimated_delivery: '2-3 Days'
            }
        ]

    } catch (error) {
        console.error('Error calculating shipping:', error)
        // On error, return empty rules (or fallback if desired, but better to fail safe for invalid pincodes)
        return []
    }
}
