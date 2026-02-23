import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, X, ChevronLeft, ChevronRight, ArrowLeft, Layers } from 'lucide-react';
import { portfolioApi, STORAGE_URL } from '../services/api';

export default function PortfolioPublic() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0, project: null });

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    try {
      const res = await portfolioApi.getPublic();
      setCategories(res.data);
    } catch {
      console.error('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  const allPortfolios = categories.flatMap(cat =>
    (cat.portfolios || []).map(p => ({ ...p, categoryName: cat.name }))
  );

  const filteredPortfolios = activeCategory === 'all'
    ? allPortfolios
    : allPortfolios.filter(p => p.portfolio_category_id === activeCategory);

  const getImage = (portfolio) => {
    if (portfolio.thumbnail) return `${STORAGE_URL}/${portfolio.thumbnail}`;
    const images = portfolio.project?.images || [];
    if (images.length > 0) return `${STORAGE_URL}/${images[0].image_path}`;
    return null;
  };

  const handleClick = (portfolio) => {
    const project = portfolio.project;
    const hasLink = project?.production_link || project?.domain_name;

    if (hasLink) {
      const url = project.production_link || `http://${project.domain_name}`;
      window.open(url, '_blank');
    } else {
      const images = project?.images || [];
      if (images.length > 0) {
        setLightbox({ open: true, images, index: 0, project });
      }
    }
  };

  const navigateLightbox = (dir) => {
    setLightbox(prev => ({
      ...prev,
      index: (prev.index + dir + prev.images.length) % prev.images.length,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <span className="text-3xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Cris</span>
            <span className="text-lg font-semibold text-gray-300">HaiNguyen Dev</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white no-underline transition-colors"
          >
            <ArrowLeft size={16} />
            Quản lý
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Dự án{' '}
          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            nổi bật
          </span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Những dự án website đẹp mà chúng tôi đã thiết kế và phát triển cho khách hàng
        </p>
      </section>

      {/* Category Filter */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex justify-center flex-wrap gap-3">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Layers size={14} className="inline mr-1.5 -mt-0.5" />
            Tất cả ({allPortfolios.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {cat.name} ({cat.portfolios?.length || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {filteredPortfolios.length === 0 ? (
          <div className="text-center py-20">
            <Layers size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Chưa có dự án nào trong hạng mục này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPortfolios.map(portfolio => {
              const imgUrl = getImage(portfolio);
              const project = portfolio.project;
              const hasLink = project?.production_link || project?.domain_name;

              return (
                <div
                  key={`${portfolio.id}-${portfolio.portfolio_category_id}`}
                  className="group cursor-pointer"
                  onClick={() => handleClick(portfolio)}
                >
                  <div className="relative rounded-2xl overflow-hidden bg-gray-800 aspect-[4/3] shadow-xl">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={project?.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <span className="text-4xl font-black text-gray-700">
                          {(portfolio.display_name || project?.name || '?')[0]}
                        </span>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="flex items-center gap-2 mb-2">
                          {hasLink && (
                            <span className="inline-flex items-center gap-1 text-xs text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded-full">
                              <ExternalLink size={10} />
                              Xem website
                            </span>
                          )}
                          {!hasLink && project?.images?.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">
                              Xem ảnh ({project.images.length})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Category Badge */}
                    {portfolio.categoryName && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                          {portfolio.categoryName}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 px-1">
                    <h3 className="text-white font-semibold text-base group-hover:text-orange-400 transition-colors">
                      {portfolio.display_name || project?.name}
                    </h3>
                    {project?.client?.name && (
                      <p className="text-gray-500 text-sm mt-0.5">{project.client.name}</p>
                    )}
                    {portfolio.short_description && (
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{portfolio.short_description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl font-black bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Cris</span>
            <span className="text-sm text-gray-400">HaiNguyen Dev</span>
          </div>
          <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>

      {/* Lightbox */}
      {lightbox.open && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(prev => ({ ...prev, open: false }))}>
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
            onClick={() => setLightbox(prev => ({ ...prev, open: false }))}
          >
            <X size={28} />
          </button>

          {lightbox.project && (
            <div className="absolute top-6 left-6 z-10">
              <h3 className="text-white font-semibold">{lightbox.project.name}</h3>
              {(lightbox.project.production_link || lightbox.project.domain_name) && (
                <a
                  href={lightbox.project.production_link || `http://${lightbox.project.domain_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-orange-400 hover:text-orange-300 no-underline mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={14} />
                  Xem website
                </a>
              )}
            </div>
          )}

          <div className="relative max-w-5xl max-h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${STORAGE_URL}/${lightbox.images[lightbox.index]?.image_path}`}
              alt=""
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>

          {lightbox.images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}
              >
                <ChevronLeft size={24} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
                onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}
              >
                <ChevronRight size={24} />
              </button>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {lightbox.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightbox(prev => ({ ...prev, index: i })); }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      i === lightbox.index ? 'bg-orange-500 scale-125' : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
