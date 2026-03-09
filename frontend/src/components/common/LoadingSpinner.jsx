export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  const spinner = (
    <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600 ${sizes[size]}`} />
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  )
}
