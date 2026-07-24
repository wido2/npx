<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Purchase Order - {{ $po->kode ?? 'Draft' }}</title>
<style>
  @page { margin: 25mm 15mm 18mm; }
  body {
    font-family: '{{ $setting['font_family'] ?? 'Segoe UI' }}', 'DejaVu Sans', sans-serif;
    font-size: {{ $setting['font_size_base'] ?? 9 }}pt;
    color: #333;
    line-height: 1.5;
    margin: 0;
    padding: 0;
  }
  table { width: 100%; border-collapse: collapse; }
  td, th { padding: 3px 5px; vertical-align: top; }

  /* ─── HEADER ─── */
  .header-table td { border: none; padding: 0; vertical-align: middle; }
  .header-table table td { border: none; padding: 0; vertical-align: middle; }
  .header-left { text-align: left; }
  .header-right { text-align: right; }
  .company-name { font-size: 14pt; font-weight: bold; color: {{ $setting['warna_secondary'] ?? '#2c3e50' }}; }
  .company-tagline { font-size: 7pt; color: #7f8c8d; margin-top: 1px; }
  .company-details { font-size: 7pt; color: #555; margin-top: 2px; line-height: 1.5; }
  .doc-title { font-size: 16pt; font-weight: bold; color: {{ $setting['warna_secondary'] ?? '#2c3e50' }}; letter-spacing: 1px; }
  .doc-ref { font-size: 9pt; color: {{ $setting['warna_primary'] ?? '#7c7bad' }}; font-weight: bold; margin-top: 2px; }
  .header-divider { border: none; border-top: 2px solid {{ $setting['warna_primary'] ?? '#7c7bad' }}; margin: 6px 0 8px; }

  /* ─── INFO BOX ─── */
  .info-table { margin-top: 4px; }
  .info-table td { border: none; vertical-align: top; width: 50%; }
  .info-box { padding: 6px 8px; }
  .info-box-title { font-size: 6.5pt; color: #7f8c8d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; font-weight: bold; }
  .info-box-content { font-size: 8pt; color: #333; line-height: 1.6; }
  .info-box-content strong { font-weight: 600; }

  /* ─── INFO ROW ─── */
  .info-row { width: 100%; margin-top: 8px; border-collapse: collapse; }
  .info-row td { width: 33.33%; padding: 8px 10px; background: #f8f9fa; font-size: 7.5pt; text-align: center; vertical-align: middle; }
  .info-row td + td { border-left: 1px solid #e5e5e5; }
  .info-row label { display: block; color: #95a5a6; font-size: 6.5pt; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; font-weight: 600; }
  .info-row span { color: #333; font-weight: 500; }

  /* ─── DATES ROW ─── */
  .dates-table { margin-top: 4px; font-size: 7.5pt; color: #555; }
  .dates-table td { border: none; padding: 2px 0; }
  .dates-table .label { color: #95a5a6; width: 1%; white-space: nowrap; padding-right: 6px; }

  /* ─── ITEMS TABLE ─── */
  .items-table { margin-top: 8px; }
  .items-table th {
    background-color: {{ $setting['warna_tabel_header'] ?? $setting['warna_primary'] ?? '#7c7bad' }};
    color: #fff;
    font-size: 7pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 5px 6px;
    text-align: center;
  }
  .items-table th.left { text-align: left; }
  .items-table th.right { text-align: right; }
  .items-table td {
    padding: 4px 6px;
    font-size: 8pt;
    border-bottom: 1px solid #eee;
  }
  .items-table tr:last-child td { border-bottom: 1px solid #ccc; }
  .items-table .no-col { text-align: center; color: #95a5a6; width: 5%; }
  .items-table .product-col { text-align: left; width: 35%; }
  .items-table .qty-col { text-align: center; width: 10%; }
  .items-table .price-col { text-align: right; width: 16%; }
  .items-table .disc-col { text-align: right; width: 10%; }
  .items-table .tax-col { text-align: right; width: 10%; }
  .items-table .total-col { text-align: right; width: 14%; font-weight: 600; }
  .items-table .section-row td {
    background-color: #f5f5f5;
    font-weight: 700;
    font-size: 9pt;
    padding: 8px 6px;
    border-bottom: 2px solid #ddd;
    color: {{ $setting['warna_secondary'] ?? '#2c3e50' }};
  }
  .items-table .section-subtotal td {
    background-color: #fafafa;
    font-weight: 600;
    font-size: 8pt;
    padding: 6px 6px;
    border-bottom: 1px solid #ccc;
  }
  .items-table .note-row td {
    font-style: italic;
    font-size: 7pt;
    color: #888;
    padding: 4px 6px 8px;
  }

  /* ─── TOTALS ─── */
  .totals-table { margin-top: 4px; width: 42%; margin-left: auto; }
  .totals-table td { padding: 2px 6px; font-size: 8pt; border: none; }
  .totals-table .label { text-align: left; color: #555; }
  .totals-table .value { text-align: right; }
  .totals-table .total-row td { font-size: 10pt; font-weight: bold; color: {{ $setting['warna_secondary'] ?? '#2c3e50' }}; padding-top: 4px; border-top: 2px solid {{ $setting['warna_secondary'] ?? '#2c3e50' }}; }
  .terbilang-row td { font-size: 7pt; font-style: italic; color: #7f8c8d; text-align: right; padding: 1px 6px; }

  /* ─── EXTRA INFO ─── */
  .extra-section { margin-top: 6px; font-size: 7.5pt; color: #555; line-height: 1.6; }
  .extra-section .label { font-weight: 600; color: #333; }

  /* ─── SIGNATURE BOXES ─── */
  .signature-table { border-collapse: separate; border-spacing: 6px; width: 100%; }
  .signature-box { border: 1px solid #ddd; border-radius: 3px; width: 24%; height: 105px; padding: 0; vertical-align: top; }
  .signature-label {
    font-size: 7pt;
    font-weight: 600;
    color: {{ $setting['warna_ttd'] ?? $setting['warna_primary'] ?? '#7c7bad' }};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 4px 6px;
    border-bottom: 1px solid #eee;
    text-align: center;
    background-color: {{ $setting['warna_ttd'] ?? $setting['warna_primary'] ?? '#7c7bad' }}10;
  }
  .signature-line { border-top: 1px solid #ccc; margin: 0 8px; margin-top: 48px; }
  .signature-name { font-size: 7.5pt; text-align: center; padding: 2px 4px; font-weight: 600; color: #333; }
  .signature-date { font-size: 6.5pt; text-align: center; color: #999; }

  /* ─── FOOTER ─── */
  .signature-section {
    margin-top: 20px;
    page-break-inside: avoid;
  }
  .footer-text {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    font-size: 6.5pt;
    text-align: center;
    color: #bbb;
    border-top: 1px solid #eee;
    padding: 6px 12mm 3px;
  }
</style>
</head>
<body>

{{-- HEADER --}}
<table class="header-table">
  <tr>
    <td class="header-left" style="width: 60%;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          @if (($setting['tampilkan_logo'] ?? true) && !empty($setting['logo']))
          <td style="width: 1%; padding: 0 10px 0 0; vertical-align: middle; border: none;">
            <img src="{{ public_path('storage/' . $setting['logo']) }}" alt="Logo" style="max-height: 125px; max-width: 125px;">
          </td>
          @endif
          <td style="padding: 0; vertical-align: middle; border: none;">
            <div class="company-name">{{ $setting['nama_perusahaan'] ?? 'PERUSAHAAN' }}</div>
            @if (!empty($setting['alamat']) || !empty($setting['kota']))
              <div class="company-details">
                @if (!empty($setting['alamat'])) {{ $setting['alamat'] }}, @endif
                @if (!empty($setting['kota'])) {{ $setting['kota'] }} @endif
                @if (!empty($setting['provinsi'])) , {{ $setting['provinsi'] }} @endif
                @if (!empty($setting['kode_pos'])) {{ $setting['kode_pos'] }} @endif
                <br>
                @if (!empty($setting['telepon'])) T: {{ $setting['telepon'] }} &nbsp;|&nbsp; @endif
                @if (!empty($setting['email'])) {{ $setting['email'] }} @endif
                @if (!empty($setting['npwp'])) &nbsp;|&nbsp; NPWP: {{ $setting['npwp'] }} @endif
              </div>
            @endif
            @if (!empty($setting['tagline']))
              <div class="company-tagline">{{ $setting['tagline'] }}</div>
            @endif
          </td>
        </tr>
      </table>
    </td>
    <td class="header-right" style="width: 40%;">
      @php
        $statusTitles = [
          'draft' => 'Pengajuan Pembelian',
          'dikirim' => 'Pengajuan Pembelian',
          'disetujui' => 'Purchase Order',
          'diterima_sebagian' => 'Purchase Order',
          'diterima' => 'Purchase Order',
          'dibatalkan' => 'Pembelian Dibatalkan',
        ];
        $docTitle = $statusTitles[$po->status] ?? ($setting['judul_laporan'] ?? 'PURCHASE ORDER');
      @endphp
      <div class="doc-title">{{ $docTitle }}</div>
      <div class="doc-ref">{{ $po->kode ?? 'DRAFT' }}</div>
    </td>
  </tr>
</table>
<hr class="header-divider">

{{-- VENDOR & CLIENT --}}
<table class="info-table">
  <tr>
    <td>
      <div class="info-box">
        <div class="info-box-title">Vendor</div>
        <div class="info-box-content">
          <strong>{{ $po->vendor->nama ?? '-' }}</strong>
          @if (!empty($po->vendor->npwp))
            <br>NPWP: {{ $po->vendor->npwp }}
          @endif
          @php $vAddr = $po->vendor->addresses?->first(); @endphp
          @if ($vAddr)
            <br>{{ $vAddr->alamat }}@if ($vAddr->kota), {{ $vAddr->kota }}@endif
          @endif
        </div>
      </div>
    </td>
    <td>
      <div class="info-box">
        <div class="info-box-title">Shipping Address</div>
        <div class="info-box-content">
          @if ($po->alamat_kirim)
            {{ $po->alamat_kirim }}
          @else
            <span style="color: #999;">-</span>
          @endif
        </div>
      </div>
    </td>
  </tr>
</table>

{{-- INFO ROW --}}
<table class="info-row">
  <tr>
    <td>
      <label>Project</label>
      <span>{{ ($setting['rahasiakan_client'] ?? false) ? ($po->client?->kode ?? '-') : ($po->client?->nama ?? '-') }}{{ $po->project ? ' — ' . $po->project->nama : '' }}</span>
    </td>
    <td>
      <label>Your Reference</label>
      <span>{{ $po->kode ?? '-' }}</span>
    </td>
    <td>
      <label>Order Date</label>
      <span>{{ \Carbon\Carbon::parse($po->tanggal_po)->locale('id')->isoFormat('D MMMM YYYY') }}</span>
    </td>
  </tr>
</table>

{{-- ITEMS TABLE --}}
<table class="items-table">
  <thead>
    <tr>
      <th class="no-col">#</th>
      <th class="left product-col">Produk</th>
      <th class="qty-col">Qty</th>
      <th class="right price-col">Harga Satuan</th>
      <th class="right disc-col">Diskon</th>
      <th class="right tax-col">Pajak</th>
      <th class="right total-col">Total</th>
    </tr>
  </thead>
  <tbody>
    @php $no = 1; $currentSection = null; $sectionSubtotal = 0; @endphp
    @forelse ($po->items as $item)
      @if ($item->display_type === 'section')
        {{-- Subtotal section sebelumnya --}}
        @if ($currentSection)
          <tr class="section-subtotal">
            <td colspan="6" style="text-align: right;">Subtotal</td>
            <td class="total-col">Rp {{ number_format($sectionSubtotal, 0) }}</td>
          </tr>
        @endif
        {{-- Header section baru --}}
        <tr class="section-row">
          <td colspan="7">{{ $item->keterangan }}</td>
        </tr>
        @php $currentSection = $item; $sectionSubtotal = 0; @endphp

      @elseif ($item->display_type === 'note')
        <tr class="note-row">
          <td colspan="7">{{ $item->keterangan }}</td>
        </tr>

      @else
        {{-- Item produk biasa --}}
        <tr>
          <td class="no-col">{{ $no++ }}</td>
          <td class="product-col">
            <div>{{ $item->barang->nama ?? '-' }}</div>
            @if (($setting['tampilkan_kode_barang'] ?? true) && $item->barang?->kode)
              <div style="font-size: 6.5pt; color: #999;">{{ $item->barang->kode }}</div>
            @endif
          </td>
          <td class="qty-col">{{ number_format($item->jumlah, 0) }}</td>
          <td class="price-col">{{ number_format($item->harga_satuan, 0) }}</td>
          <td class="disc-col">{{ $item->diskon > 0 ? number_format($item->diskon, 0) : '0' }}</td>
          <td class="tax-col">{{ $item->nilai_pajak > 0 ? number_format($item->nilai_pajak, 0) : '0' }}</td>
          <td class="total-col">{{ number_format($item->total_setelah_pajak, 0) }}</td>
        </tr>
        @php $sectionSubtotal += $item->total_setelah_pajak; @endphp
      @endif
    @empty
    <tr>
      <td colspan="7" style="text-align: center; padding: 16px; color: #999;">Tidak ada item</td>
    </tr>
    @endforelse
    {{-- Subtotal section terakhir --}}
    @if ($currentSection)
      <tr class="section-subtotal">
        <td colspan="6" style="text-align: right;">Subtotal</td>
        <td class="total-col">Rp {{ number_format($sectionSubtotal, 0) }}</td>
      </tr>
    @endif
  </tbody>
</table>

{{-- TOTALS --}}
@php
  $totalPajak = $po->items->sum('nilai_pajak');
  $subtotal = $po->subtotal;
  $grandTotal = $po->total;
@endphp
<table class="totals-table">
  <tr>
    <td class="label">Untaxed Amount</td>
    <td class="value">Rp {{ number_format($subtotal, 0) }}</td>
  </tr>
  @if ($totalPajak > 0)
  <tr>
    <td class="label">
      <div>Taxes</div>
      <div style="font-size: 7pt; color: #888; padding-left: 8px;">PPN 11%: Rp {{ number_format($totalPajak, 0) }}</div>
    </td>
    <td class="value">Rp {{ number_format($totalPajak, 0) }}</td>
  </tr>
  @endif
  <tr class="total-row">
    <td class="label">Total</td>
    <td class="value">Rp {{ number_format($grandTotal, 0) }}</td>
  </tr>
  <tr class="terbilang-row">
    <td colspan="2">{{ terbilang($grandTotal) }}</td>
  </tr>
</table>

{{-- EXTRA INFO --}}
@if ($po->catatan)
<div class="extra-section">
  @if ($po->catatan)
    <div><span class="label">Catatan:</span> {{ $po->catatan }}</div>
  @endif
</div>
@endif

{{-- SIGNATURE --}}
@if ($setting['tampilkan_ttd'] ?? true)
<div class="signature-section">
  <table class="signature-table">
    <tr>
      <td class="signature-box">
        <div class="signature-label">Dibuat Oleh</div>
        <div class="signature-line"></div>
        <div class="signature-name">{{ $po->dibuatOleh?->name ?? '________________' }}</div>
        <div class="signature-date">{{ $po->created_at ? \Carbon\Carbon::parse($po->created_at)->locale('id')->isoFormat('D MMMM YYYY') : '' }}</div>
      </td>
      <td class="signature-box">
        <div class="signature-label">Mengetahui</div>
        <div class="signature-line"></div>
        <div class="signature-name">________________</div>
        <div class="signature-date">&nbsp;</div>
      </td>
      <td class="signature-box">
        <div class="signature-label">Menyetujui</div>
        <div class="signature-line"></div>
        <div class="signature-name">{{ $po->disetujuiOleh?->name ?? '________________' }}</div>
        <div class="signature-date">{{ $po->tanggal_disetujui ? \Carbon\Carbon::parse($po->tanggal_disetujui)->locale('id')->isoFormat('D MMMM YYYY') : '' }}</div>
      </td>
      <td class="signature-box">
        <div class="signature-label">Penerima</div>
        <div class="signature-line"></div>
        <div class="signature-name">{{ $po->diterimaOleh?->name ?? '________________' }}</div>
        <div class="signature-date">{{ $po->tanggal_diterima ? \Carbon\Carbon::parse($po->tanggal_diterima)->locale('id')->isoFormat('D MMMM YYYY') : '' }}</div>
      </td>
    </tr>
  </table>
</div>
@endif

{{-- FOOTER --}}
@if ($setting['tampilkan_footer'] ?? true)
<div class="footer-text">
  Dicetak: {{ now()->locale('id')->isoFormat('D MMMM YYYY HH:mm') }} — Dicetak dari sistem
</div>
@endif

</body>
</html>
