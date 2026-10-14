"use client";

import { useState } from "react";
import { sourcesWarning } from "@/lib/admin/warnings";

export function SourcesField({ defaultValue, className, labelClass }: { defaultValue: string; className: string; labelClass: string }) {
  const [value, setValue] = useState(defaultValue);
  const warning = sourcesWarning(value);
  return (
    <>
      <label className="block space-y-1">
        <span className={labelClass}>Sources (one per line: Label | https://link)</span>
        <textarea name="sources" rows={4} value={value} onChange={(event) => setValue(event.target.value)} className={className} />
      </label>
      {warning ? <p role="status" className="text-sm text-ink-soft">⚠ {warning}</p> : null}
    </>
  );
}
