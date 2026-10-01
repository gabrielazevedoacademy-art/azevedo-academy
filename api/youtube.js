'use strict';

const CHANNEL_ID = 'UCal4KF4mgJCUrFXu4Qw5aog';
const LONG_FORM_PLAYLIST_ID = `UULF${CHANNEL_ID.slice(2)}`;
const CHANNEL_FEED = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const LONG_FORM_FEED = `https://www.youtube.com/feeds/videos.xml?playlist_id=${LONG_FORM_PLAYLIST_ID}`;

function decodeXml(value = '') {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return value.replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos);/gi, (match, entity) => {
    if (entity[0] === '#') {
      const hex = entity[1]?.toLowerCase() === 'x';
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return named[entity.toLowerCase()] || match;
  });
}

function tagValue(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1].trim()) : '';
}

function parseFeed(xml, limit) {
  return Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/gi))
    .slice(0, limit)
    .map(([, entry]) => {
      const videoId = tagValue(entry, 'yt:videoId');
      const title = tagValue(entry, 'title');
      const publishedAt = tagValue(entry, 'published');

      if (!videoId || !title) return null;

      return {
        id: videoId,
        title,
        publishedAt,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        thumbnailFallback: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      };
    })
    .filter(Boolean);
}

async function fetchFeed(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/atom+xml, application/xml;q=0.9, text/xml;q=0.8',
        'User-Agent': 'AzevedoAcademy/1.0 (+https://www.azevedoacademy.com.br)'
      },
      signal: controller.signal
    });

    if (!response.ok) throw new Error(`Feed request failed with ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requested = Number.parseInt(req.query?.limit, 10);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 6) : 3;

  try {
    let xml;
    try {
      xml = await fetchFeed(LONG_FORM_FEED);
    } catch {
      xml = await fetchFeed(CHANNEL_FEED);
    }

    let videos = parseFeed(xml, limit);

    if (!videos.length && xml) {
      const fallbackXml = await fetchFeed(CHANNEL_FEED);
      videos = parseFeed(fallbackXml, limit);
    }

    if (!videos.length) throw new Error('No videos found in YouTube feed');

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=86400');
    return res.status(200).json({
      channelId: CHANNEL_ID,
      channelUrl: 'https://www.youtube.com/@Azevedo.Academy/videos',
      videos
    });
  } catch (error) {
    console.error('YouTube feed error:', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Unable to load YouTube videos' });
  }
};
