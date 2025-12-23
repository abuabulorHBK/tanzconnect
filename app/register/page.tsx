'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type UserType = 'entrepreneur' | 'individual_investor' | 'institutional_investor'
export default function Register() {
  const router = useRouter()
  const [userType, setUserType] = useState<UserType>('entrepreneur')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          email,
          user_type: userType,
        })

      if (profileError) throw profileError

      if (userType === 'entrepreneur') {
        router.push('/entrepreneur/dashboard')
      } else {
        router.push('/investor/dashboard')
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError(String(err))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Join TanzConnect</h2>
        
        {error && (
          <div className="bg-red-50 text-red-800 p-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">I am a:</label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="entrepreneur"
                  checked={userType === 'entrepreneur'}
                  onChange={(e) => setUserType(e.target.value as UserType)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Entrepreneur</div>
                  <div className="text-sm text-gray-600">Seeking funding for my business</div>
                </div>
              </label>

              <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="individual_investor"
                  checked={userType === 'individual_investor'}
                  onChange={(e) => setUserType(e.target.value as UserType)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Individual Investor</div>
                  <div className="text-sm text-gray-600">Looking to invest in businesses</div>
                </div>
              </label>

              <label className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="institutional_investor"
                  checked={userType === 'institutional_investor'}
                  onChange={(e) => setUserType(e.target.value as UserType)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Institutional Investor</div>
                  <div className="text-sm text-gray-600">Bank, fund, or development organization</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Minimum 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>

          <p className="text-center text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}