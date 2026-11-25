'use client';
/**
 * Xem thử mô hình .glb trong quản trị (Thiết bị phòng gym): đặt mô hình cạnh khung kích thước thật (Rộng × Sâu × Cao),
 * co giãn ĐỀU như phòng lab, rồi báo: tỷ lệ so với thông số, hướng máy (trục dài có khớp không), chân có chạm sàn,
 * số tam giác và dung lượng file. Không sửa file — chỉ để kiểm tra trước khi dùng.
 */
import { useEffect, useRef, useState } from 'react';
import type { Equipment } from '@/lib/equipment';

type Report = { kb: number; tris: number; size: [number, number, number]; scale: number; fit: [number, number, number]; floorGap: number; rotated: boolean; warnings: string[] };

export function GlbPreview({ eq, onClose }: { eq: Equipment; onClose: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [rep, setRep] = useState<Report | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    let off = false, dispose = () => {};
    (async () => {
      const THREE = await import('three');
      const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');
      const el = host.current!;
      let renderer: import('three').WebGLRenderer;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { setErr('Trình duyệt không chạy được WebGL để xem thử.'); return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      el.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xffffff, 0xc9d3ee, 1.2));
      const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(3, 5, 4); scene.add(sun);
      const cam = new THREE.PerspectiveCamera(40, 1, .05, 100);
      const ctl = new OrbitControls(cam, renderer.domElement); ctl.enableDamping = true;
      const W = eq.width / 100, D = eq.depth / 100, H = eq.height / 100;
      // sàn lưới 10 cm + khung kích thước thật
      const grid = new THREE.GridHelper(Math.max(W, D) * 2.4, Math.round(Math.max(W, D) * 24), 0x94a3b8, 0xe2e8f0); scene.add(grid);
      const frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(W, H, D)), new THREE.LineBasicMaterial({ color: 0xf26b1d }));
      frame.position.y = H / 2; scene.add(frame);
      const front = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, .02, D / 2), .5, 0x2563eb); scene.add(front);
      const span = Math.max(W, D, H);
      cam.position.set(span * 1.6, span * 1.2, span * 1.8); ctl.target.set(0, H / 2, 0); ctl.update();
      const resize = () => { const w = el.clientWidth || 480, h = el.clientHeight || 360; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
      resize();
      let raf = 0; const loop = () => { raf = requestAnimationFrame(loop); ctl.update(); renderer.render(scene, cam); }; loop();
      dispose = () => { cancelAnimationFrame(raf); ctl.dispose(); renderer.dispose(); renderer.domElement.remove(); };
      try {
        const res = await fetch(eq.model);
        if (!res.ok) throw Error('Không tải được file mô hình.');
        const buf = await res.arrayBuffer();
        const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
        const gltf = await loader.parseAsync(buf, '');
        if (off) return;
        const m = gltf.scene;
        let tris = 0;
        m.traverse(o => { const mesh = o as import('three').Mesh; if (mesh.isMesh) { const g = mesh.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });
        const bb = new THREE.Box3().setFromObject(m), size = bb.getSize(new THREE.Vector3());
        const s = Math.min(W / size.x, D / size.z, H / size.y);
        m.scale.setScalar(s);
        const bb2 = new THREE.Box3().setFromObject(m), c = bb2.getCenter(new THREE.Vector3());
        m.position.set(-c.x, -bb2.min.y, -c.z);
        scene.add(m);
        const fit: [number, number, number] = [size.x * s / W, size.y * s / H, size.z * s / D];
        const warnings: string[] = [];
        const rotated = (size.x >= size.z) !== (W >= D) && Math.abs(W - D) > .15;
        if (rotated) warnings.push('Trục dài của mô hình không khớp Rộng/Sâu trong thông số — có thể mô hình đang xoay 90°. Xoay lại trong Blender hoặc đổi Rộng ↔ Sâu.');
        if (Math.min(...fit) < .8) warnings.push(`Tỷ lệ mô hình lệch thông số (vừa khung theo ${fit.map(f => Math.round(f * 100) + '%').join(' / ')} theo rộng / cao / sâu). Phòng lab co giãn đều nên không méo, nhưng máy sẽ nhỏ hơn khung thật — kiểm tra lại kích thước.`);
        const gap = bb.min.y;
        if (Math.abs(gap) > Math.max(.02, size.y * .03)) warnings.push(`Đáy mô hình cách gốc toạ độ ${(gap * 100).toFixed(0)} cm (đơn vị file). Phòng lab tự đặt đáy chạm sàn, nhưng nên sửa gốc trong Blender cho chuẩn.`);
        if (tris > 60000) warnings.push(`${Math.round(tris).toLocaleString('vi-VN')} tam giác — nặng cho điện thoại, nên tải lại để hệ thống giảm lưới.`);
        if (buf.byteLength > 1024 * 1024) warnings.push(`File ${(buf.byteLength / 1048576).toFixed(1)} MB — nên dưới 1 MB.`);
        setRep({ kb: Math.round(buf.byteLength / 1024), tris: Math.round(tris), size: [size.x, size.y, size.z], scale: s, fit, floorGap: gap, rotated, warnings });
      } catch (x) { if (!off) setErr(x instanceof Error ? x.message : 'Không đọc được mô hình.'); }
    })();
    return () => { off = true; dispose(); };
  }, [eq]);
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return (
    <div className="eq-glbprev" role="dialog" aria-label={`Xem thử mô hình ${eq.name}`}>
      <div className="eq-glbprev__head"><b>Xem thử 3D · {eq.name}</b><button type="button" className="admin-secondary" onClick={onClose}>Đóng</button></div>
      <div ref={host} className="eq-glbprev__stage" />
      <p className="eq-hint">Khung cam = kích thước thật {eq.width}×{eq.depth}×{eq.height} cm · mũi tên xanh = mặt trước (+z, phía người dùng máy tạ)</p>
      {err && <p className="mb-err" role="alert">{err}</p>}
      {rep && (
        <dl className="eq-glbprev__rep">
          <div><dt>Dung lượng</dt><dd>{rep.kb.toLocaleString('vi-VN')} KB</dd></div>
          <div><dt>Tam giác</dt><dd>{rep.tris.toLocaleString('vi-VN')}</dd></div>
          <div><dt>Kích thước file</dt><dd>{rep.size.map(v => v.toFixed(2)).join(' × ')} (đơn vị file)</dd></div>
          <div><dt>Vừa khung</dt><dd>{pct(rep.fit[0])} · {pct(rep.fit[1])} · {pct(rep.fit[2])}</dd></div>
          <div><dt>Hướng</dt><dd>{rep.rotated ? 'Có thể lệch 90°' : 'Khớp'}</dd></div>
          {rep.warnings.length > 0 ? rep.warnings.map(w => <p key={w} className="eq-glb is-warn">⚠ {w}</p>) : <p className="eq-glb">✓ Mô hình khớp thông số, dùng được trong phòng lab.</p>}
        </dl>
      )}
    </div>
  );
}
