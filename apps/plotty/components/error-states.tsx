import { Lock, AlertTriangle, XCircle, FileQuestion } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";


export function MissingKeyError() {
  return (
    <div className="py-0 sm:py-12 lg:py-16 sm:px-4">
      <div className="container mx-auto max-w-2xl !px-0 sm:!px-6 lg:!px-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-2xl font-bold">Missing Encryption Key</h1>
            <p className="mb-6">
              This poll requires an encryption key to view. The key should be included in the
              URL after the # symbol.
            </p>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium mb-2">Expected URL format:</p>
              <code className="text-sm font-mono">
                /poll/[id]#[encryption-key]
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface PollNotFoundErrorProps {
  className?: string;
  isAdmin?: boolean;
}

export function PollNotFoundError({ isAdmin = false }: PollNotFoundErrorProps) {
  return (
    <div className="py-0 sm:py-12 lg:py-16 sm:px-4">
      <div className="container mx-auto max-w-2xl !px-0 sm:!px-6 lg:!px-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <FileQuestion className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-2xl font-bold">
              {isAdmin ? "Poll Not Found or Access Denied" : "Poll Not Found"}
            </h1>
            <p className="mb-6">
              {isAdmin
                ? "This poll doesn't exist, has expired, or you don't have admin access."
                : "This poll doesn't exist or may have been removed."}
            </p>
            <Button onClick={() => window.location.href = '/'} className="px-6">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface DecryptionErrorProps {
  className?: string;
  error?: string;
}

export function DecryptionError({ error }: DecryptionErrorProps) {
  return (
    <div className="py-0 sm:py-12 lg:py-16 sm:px-4">
      <div className="container mx-auto max-w-2xl !px-0 sm:!px-6 lg:!px-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-2xl font-bold">Decryption Failed</h1>
            <p className="mb-6">
              Unable to decrypt the poll data. This could be due to an invalid
              encryption key or corrupted data.
            </p>
            <div className="rounded-lg border p-4 mb-6">
              <p className="text-sm font-medium mb-2">Technical details:</p>
              <code className="text-sm font-mono break-all">
                {error}
              </code>
            </div>
            <Button onClick={() => window.location.href = '/'} className="px-6">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}