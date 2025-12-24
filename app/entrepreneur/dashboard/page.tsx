'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'


export default function EntrepreneurDashboard() {
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
                .from('entrepreneur_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (!profileData) {
                router.push('/entrepreneur/profile/create')
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
                    <h2 className="text-3xl font-bold mb-6">Entrepreneur Dashboard</h2>

                    {/* Verification Status */}
                    <div className="mb-8">
                        <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                            profile.verification_status === 'verified' 
                                ? 'bg-green-100 text-green-800'
                                : profile.verification_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                        }`}>
                            Status: {profile.verification_status.toUpperCase()}
                        </div>
                        
                        {profile.verification_status === 'pending' && (
                            <p className="text-gray-600 mt-4">
                                Your profile is being reviewed. You'll be notified within 2-3 business days.
                            </p>
                        )}
                        
                        {profile.verification_status === 'verified' && (
                            <p className="text-green-600 mt-4">
                                ✓ Your profile is verified and visible to investors!
                            </p>
                        )}
                    </div>

                    {/* Profile Summary */}
                    <div className="border-t pt-6">
                        <h3 className="text-xl font-bold mb-4">Your Business Profile</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Business Name</p>
                                <p className="font-medium">{profile.business_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Industry</p>
                                <p className="font-medium">{profile.industry}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Stage</p>
                                <p className="font-medium capitalize">{profile.stage}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Funding Needed</p>
                                <p className="font-medium">
                                    TZS {(profile.funding_needed_tzs / 1000000).toFixed(1)}M
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Location</p>
                                <p className="font-medium">{profile.location}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Business Registered</p>
                                <p className="font-medium">{profile.business_registered ? 'Yes' : 'No'}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-sm text-gray-600 mb-2">Public Pitch</p>
                            <p className="text-gray-800">{profile.public_pitch}</p>
                        </div>
                    </div>

                    {/* Featured Projects Section (placeholder) */}
                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-xl font-bold mb-4">Featured Institutional Projects</h3>
                        <div className="bg-gray-50 rounded p-8 text-center text-gray-500">
                            No featured projects available yet. Check back soon!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}