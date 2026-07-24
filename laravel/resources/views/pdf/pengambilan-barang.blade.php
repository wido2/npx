<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Pengambilan Barang - {{ $pb->kode }}</title>
<style>
  @page { margin: 15mm 12mm 15mm; }
  body {
    font-family: 'Segoe UI', 'DejaVu Sans', sans-serif;
    font-size: 9pt;
    color: #333;
    line-height: 1.5;
    margin: 0;
    padding: 0;
  }
  table { width: 100%; border-collapse: collapse; }
  td, th { padding: 3px 5px; vertical-align: top; }

  /* ─── HEADER ─── */
  .header-table td { border: none; padding: 0; vertical-align: middle; }
  .header-left { text-align: left; }
  .header-right { text-align: right; }
  .company-name { font-size: 14pt; font-weight: bold; color: #2c3e50; }
  .company-details { font-size: 7pt; color: #555; margin-top: 2px; line-height: 1.5; }
  .doc-title { font-size: 16pt; font-weight: bold; color: #2c3e50; letter-spacing: 1px; }
  .doc-ref { font-size: 9pt; color: #7c7bad; font-weight: bold; margin-top: 2px; }
  .header-divider { border: none; border-top: 2px solid #7c7bad; margin: 6px 0 8px; }

  /* ─── INFO ROW ─── */
  .info-row { width: 100%; margin-top: 8px; border-collapse: collapse; }
  .info-row td { width: 33.33%; padding: 8px 10px; background: #f8f9fa; font-size: 7.5pt; text-align: center; vertical-align: middle; }
  .info-row td + td { border-left: 1px solid #e5e5e5; }
  .info-row label { display: block; color: #95a5a6; font-size: 6.5pt; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; font-weight: 600; }
  .info-row span { color: #333; font-weight: 500; }

  /* ─── KETERANGAN ─── */
  .extra-section { margin-top: 6px; font-size: 7.5pt; color: #555; line-height: 1.6; }
  .extra-section .label { font-weight: 600; color: #333; }

  /* ─── ITEMS TABLE ─── */
  .items-table { margin-top: 8px; }
  .items-table th {
    background-color: #7c7bad;
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
  .items-table .product-col { text-align: left; }
  .items-table .qty-col { text-align: center; width: 8%; }
  .items-table .satuan-col { text-align: center; width: 10%; }
  .items-table .ket-col { text-align: left; width: 22%; }

  /* ─── SIGNATURE ─── */
  .signature-table { border-collapse: separate; border-spacing: 6px; width: 100%; }
  .signature-box { border: 1px solid #ddd; border-radius: 3px; width: 33%; height: 105px; padding: 0; vertical-align: top; }
  .signature-label {
    font-size: 7pt;
    font-weight: 600;
    color: #7c7bad;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 4px 6px;
    border-bottom: 1px solid #eee;
    text-align: center;
    background-color: #7c7bad10;
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
          </td>
        </tr>
      </table>
    </td>
    <td class="header-right" style="width: 40%;">
      <div class="doc-title">PENGAMBILAN BARANG</div>
      <div class="doc-ref">{{ $pb->kode }}</div>
    </td>
  </tr>
</table>
<hr class="header-divider">

{{-- INFO ROW --}}
<table class="info-row">
  <tr>
    <td>
      <label>Tanggal</label>
      <span>{{ \Carbon\Carbon::parse($pb->tanggal_pengambilan)->locale('id')->isoFormat('D MMMM YYYY') }}</span>
    </td>
    <td>
      <label>Client</label>
      <span>{{ $pb->client?->nama ?? '-' }}</span>
    </td>
    <td>
      <label>Project</label>
      <span>{{ $pb->project?->nama ?? '-' }}</span>
    </td>
  </tr>
</table>

{{-- KETERANGAN --}}
@if ($pb->keterangan)
<div class="extra-section">
  <div><span class="label">Keterangan:</span> {{ $pb->keterangan }}</div>
</div>
@endif

{{-- ITEMS TABLE --}}
<table class="items-table">
  <thead>
    <tr>
      <th class="no-col">#</th>
      <th class="left product-col">Barang</th>
      <th class="qty-col">Jumlah</th>
      <th class="satuan-col">Satuan</th>
      <th class="left ket-col">Keterangan</th>
    </tr>
  </thead>
  <tbody>
    @php $no = 1; @endphp
    @forelse ($pb->items as $item)
      <tr>
        <td class="no-col">{{ $no++ }}</td>
        <td class="product-col">
          <div>{{ $item->barang->nama ?? '-' }}</div>
          @if ($item->barang?->kode)
            <div style="font-size: 6.5pt; color: #999;">{{ $item->barang->kode }}</div>
          @endif
        </td>
        <td class="qty-col">{{ number_format($item->jumlah, 0) }}</td>
        <td class="satuan-col">{{ $item->barang?->unit?->singkatan ?? '-' }}</td>
        <td class="ket-col">{{ $item->keterangan ?? '-' }}</td>
      </tr>
    @empty
    <tr>
      <td colspan="5" style="text-align: center; padding: 16px; color: #999;">Tidak ada item</td>
    </tr>
    @endforelse
  </tbody>
</table>

{{-- SIGNATURE --}}
<div class="signature-section">
  <table class="signature-table">
    <tr>
      <td class="signature-box">
        <div class="signature-label">Yang Menyerahkan</div>
        <div class="signature-line"></div>
        <div class="signature-name">________________</div>
        <div class="signature-date">&nbsp;</div>
      </td>
      <td class="signature-box">
        <div class="signature-label">Yang Menerima</div>
        <div class="signature-line"></div>
        <div class="signature-name">{{ $pb->karyawan?->nama ?? '________________' }}</div>
        <div class="signature-date">&nbsp;</div>
      </td>
      <td class="signature-box">
        <div class="signature-label">Mengetahui</div>
        <div class="signature-line"></div>
        <div class="signature-name">________________</div>
        <div class="signature-date">&nbsp;</div>
      </td>
    </tr>
  </table>
</div>

{{-- FOOTER --}}
<div class="footer-text">
  Dicetak: {{ now()->locale('id')->isoFormat('D MMMM YYYY HH:mm') }}
</div>

</body>
</html>
