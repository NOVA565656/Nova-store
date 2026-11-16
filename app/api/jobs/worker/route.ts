// ... inside the try block after AI returns:
    if (!aiResult.pass) {
      await supabaseAdmin.from('listings').update({ status: 'archived' }).eq('id', listing.id);
      await supabaseAdmin.from('jobs').update({ status: 'failed', result: aiResult }).eq('id', job.id);
    } else {
      await supabaseAdmin.from('listings').update({ status: 'plan_ready', ai_plan: aiResult.plan }).eq('id', listing.id);
      await supabaseAdmin.from('jobs').update({ status: 'completed', result: aiResult }).eq('id', job.id);
      
      // Trigger Notification
      await supabaseAdmin.from('notifications').insert({
        user_id: listing.seller_id,
        type: 'plan_ready',
        content: `AI plan is ready for: ${listing.title}`,
        link: `/dashboard`
      });
    }