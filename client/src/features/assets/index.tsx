import { Box } from 'lucide-react'

export default function AssetsPage() {
  return (
    <div className="p-6 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-3 mb-4">
        <Box className="w-5 h-5" />
        <h2 className="text-lg font-semibold text-foreground">Assets</h2>
      </div>
      <p className="text-sm text-muted-foreground">Assets module coming soon — backend integration in progress.</p>
    </div>
  )
}
