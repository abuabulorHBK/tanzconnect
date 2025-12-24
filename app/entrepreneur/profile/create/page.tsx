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

const BUSINESS_STAGES = [
  { value: 'idea', label: 'Idea Stage (no revenue yet)' },
  { value: 'startup', label: 'Startup (early revenue, <2 years)' },
  { value: 'growth', label: 'Growth Stage (established, 2+ years)' }
]

export default function CreateEntrepreneurProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  const [businessName, setBusinessName] = useState('')
  const [industry, setIndustry] = useState('')
  const [stage, setStage] = useState('startup')
  const [fundingNeeded, setFundingNeeded] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [publicPitch, setPublicPitch] = useState('')
  const [extendedSummary, setExtendedSummary] = useState('')
  const [businessRegistered, setBusinessRegistered] = useState(false)
  const [hasRevenue, setHasRevenue] = useState(false)
  const [monthsOperating, setMonthsOperating] = useState('')

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      const { data: existingProfile } = await supabase
        .from('entrepreneur_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingProfile) {
        router.push('/entrepreneur/dashboard')
      }
    }
    getUser()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (publicPitch.length > 280) {
      setError('Public pitch must be 280 characters or less')
      setLoading(false)
      return
    }

    if (!businessRegistered && stage !== 'idea') {
      setError('Business must be registered for Startup or Growth stage')
      setLoading(false)
      return
    }

    try {
      const { error: insertError } = await supabase
        .from('entrepreneur_profiles')
        .insert({
          user_id: userId,
          business_name: businessName,
          industry,
          stage,
          funding_needed_tzs: parseInt(fundingNeeded), // This line remains unchanged
          location,
          phone,
          public_pitch: publicPitch,
          extended_summary: extendedSummary || null,
          business_registered: businessRegistered,
          has_revenue: hasRevenue,
          months_operating: parseInt(monthsOperating) || 0,
          verification_status: 'pending',
          visibility_status: 'hidden'
        })

      if (insertError) throw insertError

      router.push('/entrepreneur/dashboard')
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
          <h1 className="text-3xl font-bold mb-2">Create Your Business Profile</h1>
          <p className="text-gray-600 mb-6">
            This information will be reviewed before being visible to investors.
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-800 p-4 rounded mb-6">
                {error}
              </div>
            )}
            {/* Funding Needed */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Funding Needed (TZS) *
              </label>
              <input
                type="number"
                required
                min="100000"
                max="500000000"
                step="100000"
                value={fundingNeeded}
                onChange={(e) => setFundingNeeded(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 50000000 (50M TZS)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter actual amount. E.g., 10,000,000 = TZS 10M
              </p>
            </div>
            {/* Industry */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Industry *
              </label>
              <select
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select industry</option>
                {TANZANIA_INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Business Stage *</label>
              <div className="space-y-2">
                {BUSINESS_STAGES.map(s => (
                  <label key={s.value} className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value={s.value}
                      checked={stage === s.value}
                      onChange={(e) => setStage(e.target.value)}
                      className="mr-3"
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Funding Needed (TZS Millions) *</label>
              <input
                type="number"
                required
                min="1"
                max="1000"
                value={fundingNeeded}
                onChange={(e) => setFundingNeeded(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 50 (for TZS 50M)"
              />
              <p className="text-sm text-gray-500 mt-1">Enter amount in millions</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Dar es Salaam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="+255 XXX XXX XXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Public Pitch (280 chars max) *</label>
              <textarea
                required
                maxLength={280}
                value={publicPitch}
                onChange={(e) => setPublicPitch(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Brief description visible to all investors"
              />
              <p className="text-sm text-gray-500 mt-1">{publicPitch.length}/280</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Extended Summary (Optional)</label>
              <textarea
                value={extendedSummary}
                onChange={(e) => setExtendedSummary(e.target.value)}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Detailed description shared after investor shows interest"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Business Validation</h3>
              
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={businessRegistered}
                    onChange={(e) => setBusinessRegistered(e.target.checked)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium">Business is registered with BRELA</div>
                    <div className="text-sm text-gray-600">Required for Startup/Growth stage</div>
                  </div>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={hasRevenue}
                    onChange={(e) => setHasRevenue(e.target.checked)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium">Business has revenue</div>
                  </div>
                </label>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Months Operating</label>
                <input
                  type="number"
                  min="0"
                  max="600"
                  value={monthsOperating}
                  onChange={(e) => setMonthsOperating(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="0 if just starting"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating profile...' : 'Submit for Verification'}
              </button>
              <p className="text-sm text-gray-600 mt-3 text-center">
                Your profile will be reviewed within 2-3 business days
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}