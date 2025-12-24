'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const TANZANIA_INDUSTRIES = [
    'Agriculture & Agribusiness',
    'Fintech & Financial Services',
    'Healthcare & Pharmaceuticals',
    'Education & EdTech',
    'Manufacturing',
    'Tourism & Hospitality',
    'Real Estate & Construction',
    'Logistics & Transportation',
    'Renewable Energy',
    'ICT & Software',
    'Mining & Natural Resources',
    'Retail & E-commerce',
    'Other'
]

export default function CreateInvestorProfile() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [userId, setUserId] = useState<string | null>(null)

    const [investorName, setInvestorName] = useState('')
    const [investorType, setInvestorType] = useState<'individual' | 'institutional'>('individual')
    const [investmentMin, setInvestmentMin] = useState('')
    const [investmentMax, setInvestmentMax] = useState('')
    const [preferredIndustries, setPreferredIndustries] = useState<string[]>([])
    const [location, setLocation] = useState('')
    const [phone, setPhone] = useState('')

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUserId(user.id)

            // Check if profile already exists
            const { data: existingProfile } = await supabase
                .from('investor_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (existingProfile) {
                router.push('/investor/dashboard')
            }
        }
        getUser()
    }, [router])

    function toggleIndustry(industry: string) {
        if (preferredIndustries.includes(industry)) {
            setPreferredIndustries(preferredIndustries.filter(i => i !== industry))
        } else {
            setPreferredIndustries([...preferredIndustries, industry])
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Validation
        const minAmount = parseInt(investmentMin)
        const maxAmount = parseInt(investmentMax)

        if (maxAmount <= minAmount) {
            setError('Maximum investment must be greater than minimum')
            setLoading(false)
            return
        }

        if (preferredIndustries.length === 0) {
            setError('Please select at least one preferred industry')
            setLoading(false)
            return
        }

        try {
            const { error: insertError } = await supabase
                .from('investor_profiles')
                .insert({
                    user_id: userId,
                    investor_name: investorName,
                    investor_type: investorType,
                    investment_range_min_tzs: minAmount,
                    investment_range_max_tzs: maxAmount,
                    preferred_industries: preferredIndustries,
                    location,
                    phone
                })

            if (insertError) throw insertError

            router.push('/investor/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!userId) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow p-8">
                    <h1 className="text-3xl font-bold mb-2">Create Your Investor Profile</h1>
                    <p className="text-gray-600 mb-6">
                        Set your investment preferences to discover relevant entrepreneurs.
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-800 p-4 rounded mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Investor Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Name / Organization Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={investorName}
                                onChange={(e) => setInvestorName(e.target.value)}
                                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                placeholder="Your name or organization name"
                            />
                        </div>

                        {/* Investor Type */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Investor Type *
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        value="individual"
                                        checked={investorType === 'individual'}
                                        onChange={(e) => setInvestorType(e.target.value as 'individual')}
                                        className="mr-3"
                                    />
                                    <div>
                                        <div className="font-medium">Individual Investor</div>
                                        <div className="text-sm text-gray-600">Angel investor, family office, or private investor</div>
                                    </div>
                                </label>

                                <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        value="institutional"
                                        checked={investorType === 'institutional'}
                                        onChange={(e) => setInvestorType(e.target.value as 'institutional')}
                                        className="mr-3"
                                    />
                                    <div>
                                        <div className="font-medium">Institutional Investor</div>
                                        <div className="text-sm text-gray-600">VC fund, PE firm, bank, development organization</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                                                {/* Investment Range */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">
                                                            Min Investment (TZS) *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            required
                                                            min="100000"
                                                            max="500000000"
                                                            step="100000"
                                                            value={investmentMin}
                                                            onChange={(e) => setInvestmentMin(e.target.value)}
                                                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                                            placeholder="e.g., 10000000 (10M TZS)"
                                                        />
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Minimum: TZS 100,000 (100K)
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-medium mb-2">
                                                            Max Investment (TZS) *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            required
                                                            min="100000"
                                                            max="500000000"
                                                            step="100000"
                                                            value={investmentMax}
                                                            onChange={(e) => setInvestmentMax(e.target.value)}
                                                            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                                            placeholder="e.g., 100000000 (100M TZS)"
                                                        />
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Maximum: TZS 500,000,000 (500M)
                                                        </p>
                                                    </div>
                                                </div>

                        {/* Preferred Industries */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Preferred Industries * (Select all that apply)
                            </label>
                            <div className="border rounded p-4 space-y-2 max-h-64 overflow-y-auto">
                                {TANZANIA_INDUSTRIES.map(industry => (
                                    <label key={industry} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={preferredIndustries.includes(industry)}
                                            onChange={() => toggleIndustry(industry)}
                                            className="mr-3"
                                        />
                                        <span>{industry}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Selected: {preferredIndustries.length} {preferredIndustries.length === 1 ? 'industry' : 'industries'}
                            </p>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Location *
                            </label>
                            <input
                                type="text"
                                required
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Dar es Salaam, International"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                                placeholder="+255 XXX XXX XXX"
                            />
                        </div>

                        {/* Submit */}
                        <div className="border-t pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                {loading ? 'Creating profile...' : 'Create Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}