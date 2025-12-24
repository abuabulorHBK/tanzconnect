'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function InvestorDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('investor_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!profileData) {
        router.push('/investor/profile/create')
        return
      }

      setProfile(profileData)
      setLoading(false)
    }
    loadProfile()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">TanzConnect</h1>
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-3xl font-bold mb-6">Investor Dashboard</h2>

          {/* Profile Summary */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Your Investment Profile</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name / Organization</p>
                <p className="font-medium">{profile.investor_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Investor Type</p>
                <p className="font-medium capitalize">{profile.investor_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Investment Range</p>
                <p className="font-medium">
                  TZS {profile.investment_range_min_tzs.toLocaleString()} - {profile.investment_range_max_tzs.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{profile.location}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-2">Preferred Industries</p>
                <p className="font-medium">{profile.preferred_industries}</p>
              </div>
            </div>
          </div>

          {/* Browse Entrepreneurs Section (placeholder) */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold mb-4">Verified Entrepreneurs</h3>
            <div className="bg-gray-50 rounded p-8 text-center text-gray-500">
              No verified entrepreneurs available yet. Check back soon!
            </div>
          </div>

          {/* Post Project Section (if institutional) */}
          {profile.investor_type === 'institutional' && (
            <div className="border-t pt-6 mt-6">
              <h3 className="text-xl font-bold mb-4">Post a Project</h3>
              <div className="bg-blue-50 border border-blue-200 rounded p-6">
                <p className="text-blue-900 mb-4">
                  As an institutional investor, you can post projects to attract entrepreneurs.
                </p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">
                  Post New Project (Coming Soon)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}